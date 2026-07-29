const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  openingHours: {
    type: String,
    required: [true, 'Opening hours are required'],
    default: '9:00 AM - 11:00 PM'
  },
  description: String,
  logo: String,
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  }
}, {
  timestamps: true
});

// Only one restaurant document should exist
restaurantSchema.statics.getRestaurant = async function() {
  let restaurant = await this.findOne();
  if (!restaurant) {
    restaurant = await this.create({
      name: "Tasty Bites Restaurant",
      phone: "+91 9876543210",
      email: "info@tastybites.com",
      address: "123 Food Street, Mumbai, Maharashtra 400001",
      openingHours: "9:00 AM - 11:00 PM",
      description: "Serving delicious food since 2010"
    });
  }
  return restaurant;
};

module.exports = mongoose.model('Restaurant', restaurantSchema);