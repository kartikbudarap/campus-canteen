const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const dbConnect = require('./config/db');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.post('/api/init-demo', async (req, res) => {
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

// ✅ FIXED: 404 handler - Remove the '*' pattern
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});