const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { priceOrderItems } = require('../utils/orderPricing');
const { emitOrderCreated } = require('../realtime/socket');

const hasRazorpayKeys = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const getRazorpay = () => new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
const signatureFor = (value, secret = process.env.RAZORPAY_KEY_SECRET) => crypto.createHmac('sha256', secret).update(value).digest('hex');

const createDemoToken = ({ paymentOrderId, userId, amount }) => {
  const payload = Buffer.from(JSON.stringify({ paymentOrderId, userId, amount, expiresAt: Date.now() + 15 * 60 * 1000 })).toString('base64url');
  return `${payload}.${signatureFor(payload, process.env.JWT_SECRET)}`;
};

const verifyDemoToken = (token, userId) => {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature) throw new Error('Invalid demo payment token');
  const expected = signatureFor(payload, process.env.JWT_SECRET);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error('Invalid demo payment signature');
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (data.userId !== String(userId) || data.expiresAt < Date.now()) throw new Error('Demo payment token expired');
  return data;
};

const createPaidOrder = async ({ req, pricedOrder, orderData, providerOrderId, paymentId, method, demo }) => {
  const existingOrder = await Order.findOne({ 'payment.razorpay_payment_id': paymentId }).populate('items.foodItem');
  if (existingOrder) return { order: existingOrder, created: false };

  const order = new Order({
    user: req.user._id,
    items: pricedOrder.items,
    total: pricedOrder.total,
    customerName: orderData.customerName || req.user.fullname,
    customerPhone: orderData.customerPhone || req.user.phone,
    deliveryAddress: orderData.deliveryAddress || req.user.address,
    specialInstructions: String(orderData.specialInstructions || '').slice(0, 500),
    payment: {
      razorpay_order_id: providerOrderId,
      razorpay_payment_id: paymentId,
      status: 'completed',
      amount: pricedOrder.total,
      payment_method: method,
      demo
    },
    status: 'pending'
  });
  await order.save();
  await order.populate('items.foodItem');
  emitOrderCreated(order);
  return { order, created: true };
};

const paymentController = {
  createRazorpayOrder: async (req, res) => {
    try {
      const pricedOrder = await priceOrderItems(req.body.orderData?.items);
      if (!hasRazorpayKeys()) {
        if (process.env.NODE_ENV === 'production') return res.status(503).json({ success: false, error: 'Payment gateway is not configured' });
        const paymentOrderId = `order_demo_${crypto.randomBytes(8).toString('hex')}`;
        return res.json({ success: true, demo: true, paymentOrderId, amount: pricedOrder.total, amountPaise: pricedOrder.totalPaise, currency: 'INR', demoToken: createDemoToken({ paymentOrderId, userId: String(req.user._id), amount: pricedOrder.totalPaise }) });
      }

      const razorpayOrder = await getRazorpay().orders.create({
        amount: pricedOrder.totalPaise,
        currency: 'INR',
        receipt: `canteen_${Date.now()}`,
        notes: { userId: String(req.user._id), environment: 'portfolio-demo' }
      });
      res.json({ success: true, demo: false, keyId: process.env.RAZORPAY_KEY_ID, paymentOrderId: razorpayOrder.id, amount: pricedOrder.total, amountPaise: razorpayOrder.amount, currency: razorpayOrder.currency });
    } catch (error) {
      const status = /item|order amount|quantity|available/i.test(error.message) ? 400 : 502;
      res.status(status).json({ success: false, error: error.message || 'Unable to start payment' });
    }
  },

  verifyRazorpayPayment: async (req, res) => {
    try {
      const { orderData, razorpayOrderId, razorpayPaymentId, razorpaySignature, demoToken } = req.body;
      if (!orderData || !razorpayOrderId) return res.status(400).json({ success: false, error: 'Payment and order data are required' });
      const pricedOrder = await priceOrderItems(orderData.items);
      let paymentId = razorpayPaymentId;
      let method = 'upi';
      let demo = false;

      if (demoToken) {
        if (process.env.NODE_ENV === 'production') return res.status(403).json({ success: false, error: 'Demo payments are disabled' });
        const demoData = verifyDemoToken(demoToken, req.user._id);
        if (demoData.paymentOrderId !== razorpayOrderId || demoData.amount !== pricedOrder.totalPaise) return res.status(409).json({ success: false, error: 'Demo payment amount mismatch' });
        paymentId = `pay_demo_${crypto.randomBytes(8).toString('hex')}`;
        method = 'upi_demo';
        demo = true;
      } else {
        if (!hasRazorpayKeys()) return res.status(503).json({ success: false, error: 'Razorpay Test Mode is not configured' });
        if (!razorpayPaymentId || !razorpaySignature) return res.status(400).json({ success: false, error: 'Razorpay verification details are required' });
        const expected = signatureFor(`${razorpayOrderId}|${razorpayPaymentId}`);
        if (razorpaySignature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(razorpaySignature), Buffer.from(expected))) return res.status(400).json({ success: false, error: 'Invalid Razorpay payment signature' });
        const providerOrder = await getRazorpay().orders.fetch(razorpayOrderId);
        if (providerOrder.amount !== pricedOrder.totalPaise || providerOrder.notes?.userId !== String(req.user._id) || providerOrder.status !== 'paid') return res.status(409).json({ success: false, error: 'Razorpay order verification failed' });
      }

      const result = await createPaidOrder({ req, pricedOrder, orderData, providerOrderId: razorpayOrderId, paymentId, method, demo });
      res.status(result.created ? 201 : 200).json({ success: true, demo, message: result.created ? 'Demo payment verified and order placed' : 'Order already confirmed', data: result.order });
    } catch (error) {
      if (error?.code === 11000) return res.status(409).json({ success: false, error: 'Payment was already used for an order' });
      res.status(500).json({ success: false, error: error.message || 'Payment verification failed' });
    }
  },

  getPaymentStatus: (req, res) => res.json({ success: true, data: { service: 'Razorpay', configured: hasRazorpayKeys(), mode: hasRazorpayKeys() ? 'test' : 'local-demo', realMoney: false } })
};

module.exports = paymentController;