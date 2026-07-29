const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date
}, {
  timestamps: true
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);