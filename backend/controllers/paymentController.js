const Order = require('../models/Order');
const { priceOrderItems } = require('../utils/orderPricing');

const getStripe = () => require('stripe')(process.env.STRIPE_SECRET_KEY);

const paymentController = {
  createPaymentIntent: async (req, res) => {
    try {
      const pricedOrder = await priceOrderItems(req.body.orderData?.items);
      const paymentIntent = await getStripe().paymentIntents.create({
        amount: pricedOrder.totalPaise,
        currency: 'inr',
        payment_method_types: ['card'],
        metadata: { userId: String(req.user._id) }
      });
      res.json({
        success: true,
        amount: pricedOrder.total,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      const status = error.message.includes('item') || error.message.includes('order amount') ? 400 : 502;
      res.status(status).json({ success: false, error: error.message || 'Payment service error' });
    }
  },

  confirmPayment: async (req, res) => {
    try {
      const { paymentIntentId, orderData } = req.body;
      if (!paymentIntentId || !orderData) {
        return res.status(400).json({ success: false, error: 'Payment and order data are required' });
      }
      const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ success: false, error: `Payment not completed. Status: ${paymentIntent.status}` });
      }
      if (paymentIntent.currency !== 'inr' || paymentIntent.metadata.userId !== String(req.user._id)) {
        return res.status(403).json({ success: false, error: 'Payment does not belong to this order' });
      }
      const existingOrder = await Order.findOne({
        'payment.stripe_payment_intent_id': paymentIntentId
      }).populate('items.foodItem');
      if (existingOrder) {
        return res.json({ success: true, message: 'Order already confirmed', data: existingOrder });
      }
      const pricedOrder = await priceOrderItems(orderData.items);
      if (paymentIntent.amount_received !== pricedOrder.totalPaise) {
        return res.status(409).json({ success: false, error: 'Paid amount does not match current order total' });
      }
      const order = new Order({
        user: req.user._id,
        items: pricedOrder.items,
        total: pricedOrder.total,
        customerName: orderData.customerName || req.user.fullname,
        customerPhone: orderData.customerPhone || req.user.phone,
        deliveryAddress: orderData.deliveryAddress || req.user.address,
        specialInstructions: String(orderData.specialInstructions || '').slice(0, 500),
        payment: {
          stripe_payment_intent_id: paymentIntentId,
          status: 'completed',
          amount: pricedOrder.total,
          payment_method: 'card'
        },
        status: 'pending'
      });
      await order.save();
      await order.populate('items.foodItem');
      res.status(201).json({ success: true, message: 'Order created successfully!', data: order });
    } catch (error) {
      if (error?.code === 11000) {
        const order = await Order.findOne({ 'payment.stripe_payment_intent_id': req.body.paymentIntentId });
        return res.json({ success: true, message: 'Order already confirmed', data: order });
      }
      res.status(500).json({ success: false, error: error.message || 'Order creation failed' });
    }
  },

  getPaymentStatus: (req, res) => {
    res.json({
      success: true,
      data: { service: 'Stripe', configured: Boolean(process.env.STRIPE_SECRET_KEY), mode: process.env.NODE_ENV === 'production' ? 'live' : 'test' }
    });
  }
};

module.exports = paymentController;
