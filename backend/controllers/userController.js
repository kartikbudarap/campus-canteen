const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userController = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      res.json({
        message: 'User profile retrieved successfully',
        data: req.user
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { fullname, phone, address } = req.body;
      const updateData = { fullname, phone, address };
      
      // Handle avatar upload
      if (req.file) {
        updateData.avatar = `/uploads/${req.file.filename}`;
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ error: errors.join(', ') });
      }
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      const user = await User.findById(req.user._id);
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
};

module.exports = userController;