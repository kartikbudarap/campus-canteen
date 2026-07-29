const Order = require('../models/Order');
const { priceOrderItems } = require('../utils/orderPricing');

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

      const currentOrder = await Order.findById(req.params.id);
      if (!currentOrder) return res.status(404).json({ error: 'Order not found' });
      if (!allowedTransitions[currentOrder.status].includes(status)) {
        return res.status(409).json({ error: `Order cannot move from ${currentOrder.status} to ${status}` });
      }
      currentOrder.status = status;
      currentOrder.statusHistory.push({ status, changedBy: req.user._id });
      await currentOrder.save();
      const order = await Order.findById(currentOrder._id)
        .populate('items.foodItem')
        .populate('user', 'fullname email phone');

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

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