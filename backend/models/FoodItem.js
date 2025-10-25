const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food item name is required'],
    trim: true,
    minlength: [2, 'Food item name must be at least 2 characters long']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters long']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  },
  ingredients: {
    type: [String],
    default: []
  },
  popular: {
  type: Boolean,
  default: false
},
}, {
  timestamps: true
});

// Index for better search performance
foodItemSchema.index({ name: 'text', description: 'text' });
foodItemSchema.index({ category: 1 });
foodItemSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('FoodItem', foodItemSchema);