const express = require('express');
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Payment routes
router.post('/create-payment-intent', auth, paymentController.createPaymentIntent);
router.post('/confirm-payment', auth, paymentController.confirmPayment);
router.get('/status', paymentController.getPaymentStatus);

module.exports = router;