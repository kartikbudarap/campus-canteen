const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const dbConnect = require('./config/db');
const { auth, authorize } = require('./middleware/auth');
const { securityHeaders } = require('./middleware/security');
const { initializeSocket } = require('./realtime/socket');

const app = express();
const server = http.createServer(app);
app.disable('x-powered-by');

// Middleware
app.use(securityHeaders);
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredOrigins,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

const corsOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.has(origin)) return callback(null, true);
  return callback(new Error(`Origin ${origin} is not allowed by CORS`));
};

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
dbConnect();

// Routes
// Add to your existing routes
app.use('/api/payment', require('./routes/payment'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/food-items', require('./routes/foodItems'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/restaurant', require('./routes/restaurant'));
app.use('/api/users', require('./routes/users'));


// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Food Ordering API is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize demo data
app.post('/api/init-demo', auth, authorize('admin'), async (req, res) => {
  try {
    const { initDemo } = require('./scripts/initDemo');
    const result = await initDemo();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : error.message 
  });
});

// FIXED: 404 handler - Remove the '*' pattern
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

initializeSocket(server, corsOrigin);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});