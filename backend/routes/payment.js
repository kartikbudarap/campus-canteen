const express = require('express');
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.post('/razorpay/order', auth, paymentController.createRazorpayOrder);
router.post('/razorpay/verify', auth, paymentController.verifyRazorpayPayment);
router.get('/status', paymentController.getPaymentStatus);

module.exports = router;