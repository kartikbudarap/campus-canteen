const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');

const orderController = {
  // Get all orders
  getOrders: async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    let filter = {};

    // DEBUG: Log user info
    console.log('🔧 ORDER DEBUG - User making request:', {
      id: req.user._id,
      role: req.user.role,
      name: req.user.fullname,
      email: req.user.email
    });

    // User can only see their own orders, admin/seller can see all
    if (req.user.role === 'user') {
      filter.user = req.user._id;
      console.log('🔧 ORDER DEBUG - Applied user filter for regular user');
    } else {
      console.log('🔧 ORDER DEBUG - No user filter (seller/admin can see all orders)');
    }

    if (status && status !== 'all') {
      filter.status = status;
      console.log('🔧 ORDER DEBUG - Status filter:', status);
    }

    console.log('🔧 ORDER DEBUG - Final MongoDB filter:', JSON.stringify(filter));

    const orders = await Order.find(filter)
      .populate('items.foodItem')
      .populate('user', 'fullname email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log('🔧 ORDER DEBUG - Orders found:', orders.length);
    
    // Log each order found
    orders.forEach((order, index) => {
      console.log(`🔧 ORDER DEBUG - Order ${index + 1}:`, {
        id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customerName,
        user: order.user?.fullname,
        status: order.status,
        items: order.items?.length,
        total: order.total
      });
    });

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
    // console.error('🔧 ORDER DEBUG - Error:', error);
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
      const { items, total, customerName, customerPhone, deliveryAddress, specialInstructions } = req.body;

      // Validation
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
      }

      if (!total || total <= 0) {
        return res.status(400).json({ error: 'Valid total amount is required' });
      }

      // Validate items and get current prices
      const orderItems = await Promise.all(
        items.map(async (item) => {
          const foodItemId = item.foodItemId || item.id || item.foodItem;
          const foodItem = await FoodItem.findById(foodItemId);
          
          if (!foodItem) {
            throw new Error(`Food item ${foodItemId} not found`);
          }

          if (!foodItem.isAvailable) {
            throw new Error(`Food item ${foodItem.name} is not available`);
          }

          return {
            foodItem: foodItem._id,
            name: foodItem.name,
            price: foodItem.price,
            quantity: item.quantity || item.qty || 1
          };
        })
      );

      const order = new Order({
        user: req.user._id,
        items: orderItems,
        total: parseFloat(total),
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
      if (error.message.includes('not found') || error.message.includes('not available')) {
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

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      )
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