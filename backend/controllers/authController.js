const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailController = require('./emailController');
const OTP = require('../models/OTP');

const authController = {
  // Register new user
register: async (req, res) => {
  try {
    const { fullname, email, password, role = 'user', otp } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // If OTP is provided, verify it first
    if (otp) {
      // FIX: Add proper error handling for OTP verification
      try {
        await emailController.verifyOTP(email, otp, 'email_verification');
      } catch (otpError) {
        // If OTP verification fails, return specific error
        return res.status(400).json({ error: otpError.message });
      }
      
      // OTP is valid, now create the user
      user = new User({
        fullname,
        email,
        password: await bcrypt.hash(password, 12),
        role,
        emailVerified: true
      });

      await user.save();

      // Generate proper authentication token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          emailVerified: true
        }
      });
    } else {
      // No OTP provided - send OTP for verification
      const generatedOtp = emailController.generateOTP();
      
      await emailController.storeOTP(email, generatedOtp, 'email_verification');
      await emailController.sendOTP(email, generatedOtp, 'email_verification');

      return res.json({
        message: 'OTP sent to your email. Please verify to complete registration.',
        requiresOtp: true,
        email: email
      });
    }
  } catch (error) {
    console.error('🔧 BACKEND ERROR - Registration failed:', error); // ADD THIS
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Server error during registration' });
  }
},

  // Login user
  login: async (req, res) => {
    try {
      const { email, password, role } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Check role if specified
      if (role && user.role !== role) {
        return res.status(400).json({ error: `Invalid role selection. Your role is ${user.role}` });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error during login' });
    }
  },

  // Get current user
  getMe: async (req, res) => {
    try {
      res.json({
        message: 'User profile retrieved successfully',
        user: req.user
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error retrieving user profile' });
    }
  },

  // Forgot password - send OTP
  forgotPassword: async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔧 BACKEND - Forgot password request for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('🔧 BACKEND - User not found:', email);
      return res.status(404).json({ error: 'User not found with this email' });
    }

    console.log('🔧 BACKEND - User found, generating OTP');
    const otp = emailController.generateOTP();
    
    console.log('🔧 BACKEND - Generated OTP:', otp);
    await emailController.storeOTP(email, otp, 'password_reset');
    await emailController.sendOTP(email, otp, 'password_reset');

    console.log('🔧 BACKEND - OTP sent successfully');
    res.json({ 
      message: 'OTP sent to your email',
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.log('🔧 BACKEND - Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
},

  // Verify OTP for password reset
  verifyOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;

      await emailController.verifyOTP(email, otp, 'password_reset');

      res.json({ 
        message: 'OTP verified successfully',
        token: 'temp_verification_token' // In real app, you might generate a temp token
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Reset password with OTP
  // Reset password with OTP
resetPassword: async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    console.log('🔧 BACKEND - Resetting password for:', email);

    // Verify OTP first (without marking as used)
    await emailController.verifyOTP(email, otp, 'password_reset');

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    // NOW mark the OTP as used after successful password reset
    await OTP.findOneAndUpdate(
      { email, otp, type: 'password_reset' },
      { used: true }
    );

    console.log('🔧 BACKEND - Password reset successfully');
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.log('🔧 BACKEND - Reset password error:', error);
    res.status(400).json({ error: error.message });
  }
},

  // Resend OTP
  resendOTP: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found with this email' });
      }

      const otp = emailController.generateOTP();
      await emailController.storeOTP(email, otp, 'password_reset');
      await emailController.sendOTP(email, otp, 'password_reset');

      res.json({ 
        message: 'OTP resent to your email',
        expiresIn: '10 minutes'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to resend OTP' });
    }
  },

  // Verify email with OTP
  verifyEmail: async (req, res) => {
    try {
      const { email, otp } = req.body;

      // Verify OTP
      await emailController.verifyOTP(email, otp, 'email_verification');

      // Update user's email verification status
      const user = await User.findOneAndUpdate(
        { email },
        { emailVerified: true },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate proper token now that email is verified
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Email verified successfully',
        token,
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          emailVerified: true
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Resend verification email
  resendVerification: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: 'Email is already verified' });
      }

      const otp = emailController.generateOTP();
      await emailController.storeOTP(email, otp, 'email_verification');
      await emailController.sendOTP(email, otp, 'email_verification');

      res.json({ 
        message: 'Verification OTP resent to your email',
        expiresIn: '10 minutes'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to resend verification email' });
    }
  }
};

module.exports = authController;