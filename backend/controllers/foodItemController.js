const FoodItem = require('../models/FoodItem');

const foodItemController = {
  // Get all food items
  getFoodItems: async (req, res) => {
    try {
      const { category, search, available, page = 1, limit = 50 } = req.query;
      let filter = {};

      if (category && category !== 'all') {
        filter.category = new RegExp(category, 'i');
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (available !== undefined) {
        filter.isAvailable = available === 'true';
      }

      const foodItems = await FoodItem.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await FoodItem.countDocuments(filter);

      res.json({
        message: 'Food items retrieved successfully',
        data: foodItems,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve food items' });
    }
  },

  // Get food item by ID
  getFoodItemById: async (req, res) => {
    try {
      const foodItem = await FoodItem.findById(req.params.id);
      if (!foodItem) {
        return res.status(404).json({ error: 'Food item not found' });
      }
      res.json({
        message: 'Food item retrieved successfully',
        data: foodItem
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid food item ID' });
      }
      res.status(500).json({ error: 'Failed to retrieve food item' });
    }
  },

  // Create food item
  createFoodItem: async (req, res) => {
    try {
      const foodData = { ...req.body };
      
      // Handle image upload
      if (req.file) {
        foodData.image = `/uploads/${req.file.filename}`;
      }

      // Convert price to number
      if (foodData.price) {
        foodData.price = parseFloat(foodData.price);
      }

      const foodItem = new FoodItem(foodData);
      await foodItem.save();

      res.status(201).json({
        message: 'Food item created successfully',
        data: foodItem
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ error: errors.join(', ') });
      }
      res.status(500).json({ error: 'Failed to create food item' });
    }
  },

  // Update food item
  updateFoodItem: async (req, res) => {
    try {
      const updateData = { ...req.body };
      
      // Handle image upload
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      // Convert price to number if provided
      if (updateData.price) {
        updateData.price = parseFloat(updateData.price);
      }

      const foodItem = await FoodItem.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!foodItem) {
        return res.status(404).json({ error: 'Food item not found' });
      }

      res.json({
        message: 'Food item updated successfully',
        data: foodItem
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ error: errors.join(', ') });
      }
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid food item ID' });
      }
      res.status(500).json({ error: 'Failed to update food item' });
    }
  },

  // Delete food item
  deleteFoodItem: async (req, res) => {
    try {
      const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
      if (!foodItem) {
        return res.status(404).json({ error: 'Food item not found' });
      }
      res.json({ message: 'Food item deleted successfully' });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid food item ID' });
      }
      res.status(500).json({ error: 'Failed to delete food item' });
    }
  },

  // Get categories
  getCategories: async (req, res) => {
    try {
      const categories = await FoodItem.distinct('category');
      res.json({
        message: 'Categories retrieved successfully',
        data: categories.filter(Boolean)
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve categories' });
    }
  }
};

module.exports = foodItemController;