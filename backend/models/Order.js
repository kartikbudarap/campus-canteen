const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    sparse: true // FIX: Allow null temporarily during bulk insert
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: String,
  deliveryAddress: String,
  specialInstructions: String,
  estimatedDelivery: Date,
  notified: {
    type: Boolean,
    default: false
  },
  payment: {
    stripe_payment_intent_id: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    amount: Number,
    payment_method: String,
    payment_date: {
      type: Date,
      default: Date.now
    }
  }
  
}, {
  timestamps: true
});

// ✅ FIXED: Generate order number before saving - handle bulk insert
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      // Get the count of existing orders
      const count = await mongoose.model('Order').countDocuments();
      this.orderNumber = `ORD${(count + 1).toString().padStart(6, '0')}`;
    } catch (error) {
      // Fallback: Use timestamp if count fails
      this.orderNumber = `ORD${Date.now()}`;
    }
  }
  next();
});

// Virtual for formatted date
orderSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });

// Indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);