const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

let io;

const initializeSocket = (httpServer, corsOrigin) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('_id role');
      if (!user) return next(new Error('User not found'));

      socket.user = { id: String(user._id), role: user.role };
      next();
    } catch (error) {
      next(new Error(error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid authentication'));
    }
  });

  io.on('connection', async (socket) => {
    socket.join(`user:${socket.user.id}`);
    socket.join(`role:${socket.user.role}`);

    try {
      const filter = socket.user.role === 'user' ? { user: socket.user.id } : {};
      const orders = await Order.find(filter)
        .populate('items.foodItem')
        .populate('user', 'fullname email phone')
        .sort({ createdAt: -1 })
        .limit(50);
      socket.emit('orders:snapshot', orders);
      socket.emit('realtime:ready', { connected: true });
    } catch {
      socket.emit('realtime:ready', { connected: true, snapshot: false });
    }
  });

  return io;
};

const emitOrderCreated = (order) => {
  if (!io || !order) return;
  io.to('role:seller').to('role:admin').emit('order:created', order);
  io.to(`user:${String(order.user?._id || order.user)}`).emit('order:created', order);
};

const emitOrderUpdated = (order) => {
  if (!io || !order) return;
  io.to('role:seller').to('role:admin').emit('order:updated', order);
  io.to(`user:${String(order.user?._id || order.user)}`).emit('order:updated', order);
};

module.exports = { initializeSocket, emitOrderCreated, emitOrderUpdated };