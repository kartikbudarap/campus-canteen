const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', restaurantController.getRestaurant);
router.put('/', auth, authorize('admin'), upload.single('logo'), restaurantController.updateRestaurant);

module.exports = router;