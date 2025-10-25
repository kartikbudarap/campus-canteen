const Restaurant = require('../models/Restaurant');

const restaurantController = {
  // Get restaurant information
  getRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.getRestaurant();
      res.json({
        message: 'Restaurant information retrieved successfully',
        data: restaurant
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve restaurant information' });
    }
  },

  // Update restaurant information
  updateRestaurant: async (req, res) => {
    try {
      const updateData = { ...req.body };
      
      // Handle logo upload
      if (req.file) {
        updateData.logo = `/uploads/${req.file.filename}`;
      }

      const restaurant = await Restaurant.findOneAndUpdate(
        {},
        updateData,
        { new: true, upsert: true, runValidators: true }
      );

      res.json({
        message: 'Restaurant information updated successfully',
        data: restaurant
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ error: errors.join(', ') });
      }
      res.status(500).json({ error: 'Failed to update restaurant information' });
    }
  }
};

module.exports = restaurantController;