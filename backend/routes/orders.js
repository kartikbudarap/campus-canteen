const express = require('express');
const orderController = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, orderController.getOrders);
router.get('/stats/overview', auth, authorize('admin', 'seller'), orderController.getOrderStats);
router.get('/:id/pickup-pass', auth, authorize('user'), orderController.getPickupPass);
router.post('/:id/verify-pickup', auth, authorize('seller', 'admin'), orderController.verifyPickup);
router.get('/:id', auth, orderController.getOrderById);
router.post('/', auth, orderController.createOrder);
router.patch('/:id/status', auth, authorize('seller', 'admin'), orderController.updateOrderStatus);

module.exports = router;
