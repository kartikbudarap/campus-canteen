const Order = require('../models/Order');
const { priceOrderItems } = require('../utils/orderPricing');
const { getRedis } = require('../config/redis');
const { createPickupCredentials, decryptCredential, hashCredential, safeMatch } = require('../utils/pickupSecurity');
const { emitOrderCreated, emitOrderUpdated } = require('../realtime/socket');

const PICKUP_TTL_SECONDS = Number(process.env.PICKUP_TTL_SECONDS || 1800);
const MAX_PICKUP_ATTEMPTS = 5;

const allowedTransitions = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

const orderController = {
  // Get all orders
  getOrders: async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    let filter = {};

    // User can only see their own orders, admin/seller can see all
    if (req.user.role === 'user') {
      filter.user = req.user._id;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('items.foodItem')
      .populate('user', 'fullname email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      message: 'Orders retrieved successfully',
      data: orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
},

  // Get order by ID
  getOrderById: async (req, res) => {
    try {
      let order;
      if (req.user.role === 'user') {
        order = await Order.findOne({ _id: req.params.id, user: req.user._id })
          .populate('items.foodItem');
      } else {
        order = await Order.findById(req.params.id)
          .populate('items.foodItem')
          .populate('user', 'fullname email phone');
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        message: 'Order retrieved successfully',
        data: order
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      res.status(500).json({ error: 'Failed to retrieve order' });
    }
  },

  // Create new order
  createOrder: async (req, res) => {
    try {
      const { items, customerName, customerPhone, deliveryAddress, specialInstructions } = req.body;
      const pricedOrder = await priceOrderItems(items);

      const order = new Order({
        user: req.user._id,
        items: pricedOrder.items,
        total: pricedOrder.total,
        customerName: customerName || req.user.fullname,
        customerPhone: customerPhone || req.user.phone,
        deliveryAddress: deliveryAddress || req.user.address,
        specialInstructions
      });

      await order.save();
      await order.populate('items.foodItem');
      emitOrderCreated(order);

      res.status(201).json({
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      if (error.message.includes('item') || error.message.includes('order amount')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create order' });
    }
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      if (status === 'completed') {
        return res.status(409).json({ error: 'Use pickup verification to complete a ready order' });
      }

      const currentOrder = await Order.findById(req.params.id);
      if (!currentOrder) return res.status(404).json({ error: 'Order not found' });
      if (!allowedTransitions[currentOrder.status].includes(status)) {
        return res.status(409).json({ error: `Order cannot move from ${currentOrder.status} to ${status}` });
      }
      currentOrder.status = status;
      if (status === 'ready') {
        const credentials = createPickupCredentials();
        currentOrder.pickup = {
          codeHash: credentials.codeHash,
          tokenHash: credentials.tokenHash,
          credentialCiphertext: credentials.credentialCiphertext,
          expiresAt: new Date(Date.now() + PICKUP_TTL_SECONDS * 1000),
          failedAttempts: 0
        };
        const redis = await getRedis();
        if (redis) {
          await redis.set(`pickup:token:${credentials.tokenHash}`, String(currentOrder._id), { EX: PICKUP_TTL_SECONDS });
        }
      }
      currentOrder.statusHistory.push({ status, changedBy: req.user._id });
      await currentOrder.save();
      const order = await Order.findById(currentOrder._id)
        .populate('items.foodItem')
        .populate('user', 'fullname email phone');

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      emitOrderUpdated(order);
      res.json({
        message: `Order status updated to ${status}`,
        data: order
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      res.status(500).json({ error: 'Failed to update order status' });
    }
  },

  // Retrieve the pickup pass only for the customer who owns the order.
  getPickupPass: async (req, res) => {
    try {
      const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
        .select('+pickup.credentialCiphertext');
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.status !== 'ready') return res.status(409).json({ error: 'Pickup pass is available only when the order is ready' });
      if (!order.pickup?.credentialCiphertext || order.pickup.expiresAt <= new Date()) {
        return res.status(410).json({ error: 'Pickup pass has expired. Ask the counter to issue a new pass.' });
      }
      if (order.pickup.verifiedAt) return res.status(409).json({ error: 'Order has already been collected' });

      const credentials = JSON.parse(decryptCredential(order.pickup.credentialCiphertext));
      res.json({
        message: 'Pickup pass retrieved',
        data: { pin: credentials.pin, token: credentials.token, expiresAt: order.pickup.expiresAt }
      });
    } catch (error) {
      if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid order ID' });
      res.status(500).json({ error: 'Failed to retrieve pickup pass' });
    }
  },

  // Verify a one-time QR token or PIN and atomically complete the order.
  verifyPickup: async (req, res) => {
    try {
      const pin = String(req.body.pin || '').trim();
      const token = String(req.body.token || '').trim();
      if (!pin && !token) return res.status(400).json({ error: 'Pickup PIN or QR token is required' });

      const order = await Order.findById(req.params.id).select('+pickup.codeHash +pickup.tokenHash');
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.status !== 'ready') return res.status(409).json({ error: 'Only ready orders can be collected' });
      if (order.payment?.payment_method && order.payment.status !== 'completed') return res.status(409).json({ error: 'Payment must be completed before pickup' });
      if (order.pickup?.verifiedAt) return res.status(409).json({ error: 'Order has already been collected' });
      if (!order.pickup?.expiresAt || order.pickup.expiresAt <= new Date()) return res.status(410).json({ error: 'Pickup pass has expired' });
      if (order.pickup.lockedUntil > new Date()) return res.status(429).json({ error: 'Pickup verification is temporarily locked' });

      const redis = await getRedis();
      const rateKey = `pickup:attempts:${order._id}`;
      if (redis) {
        const attempts = await redis.incr(rateKey);
        if (attempts === 1) await redis.expire(rateKey, 300);
        if (attempts > MAX_PICKUP_ATTEMPTS) return res.status(429).json({ error: 'Too many pickup attempts. Try again later.' });
      }

      const valid = pin
        ? /^\d{6}$/.test(pin) && safeMatch(pin, order.pickup.codeHash)
        : safeMatch(token, order.pickup.tokenHash);

      if (!valid) {
        const failedAttempts = (order.pickup.failedAttempts || 0) + 1;
        const update = { 'pickup.failedAttempts': failedAttempts };
        if (failedAttempts >= MAX_PICKUP_ATTEMPTS) update['pickup.lockedUntil'] = new Date(Date.now() + 5 * 60 * 1000);
        await Order.updateOne({ _id: order._id }, { $set: update });
        return res.status(422).json({ error: 'Incorrect pickup PIN or QR code' });
      }

      const completed = await Order.findOneAndUpdate(
        { _id: order._id, status: 'ready', 'pickup.verifiedAt': { $exists: false } },
        {
          $set: { status: 'completed', 'pickup.verifiedAt': new Date(), 'pickup.verifiedBy': req.user._id },
          $push: { statusHistory: { status: 'completed', changedBy: req.user._id, changedAt: new Date() } }
        },
        { new: true }
      ).populate('items.foodItem').populate('user', 'fullname email phone');

      if (!completed) return res.status(409).json({ error: 'Order was already collected' });
      if (redis) {
        const keys = [redis.del(rateKey)];
        if (token) keys.push(redis.del(`pickup:token:${hashCredential(token)}`));
        await Promise.all(keys);
      }
      emitOrderUpdated(completed);
      res.json({ message: 'Pickup verified and order completed', data: completed });
    } catch (error) {
      if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid order ID' });
      res.status(500).json({ error: 'Failed to verify pickup' });
    }
  },
  // Get order statistics
  getOrderStats: async (req, res) => {
    try {
      const totalOrders = await Order.countDocuments();
      const completedOrders = await Order.countDocuments({ status: 'completed' });
      const pendingOrders = await Order.countDocuments({ status: 'pending' });
      const activeOrders = await Order.countDocuments({ 
        status: { $in: ['accepted', 'preparing', 'ready'] } 
      });

      const revenueResult = await Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);

      const totalRevenue = revenueResult[0]?.total || 0;

      // Today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysOrders = await Order.countDocuments({
        createdAt: { $gte: today }
      });

      res.json({
        message: 'Order statistics retrieved successfully',
        data: {
          totalOrders,
          completedOrders,
          pendingOrders,
          activeOrders,
          todaysOrders,
          totalRevenue
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve order statistics' });
    }
  }
};

module.exports = orderController;




