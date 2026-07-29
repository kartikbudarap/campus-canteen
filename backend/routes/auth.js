const express = require('express');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { rateLimit } = require('../middleware/security');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const otpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5 });

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', auth, authController.getMe);

// New routes for password reset and email verification
router.post('/forgot-password', otpLimiter, authController.forgotPassword);
router.post('/verify-otp', otpLimiter, authController.verifyOTP);
router.post('/reset-password', otpLimiter, authController.resetPassword);
router.post('/resend-otp', otpLimiter, authController.resendOTP);
router.post('/verify-email', otpLimiter, authController.verifyEmail);
router.post('/resend-verification', otpLimiter, authController.resendVerification);

module.exports = router;