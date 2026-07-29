const express = require('express');
const foodItemController = require('../controllers/foodItemController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', foodItemController.getFoodItems);
router.get('/data/categories', foodItemController.getCategories);
router.get('/:id', foodItemController.getFoodItemById);
router.post('/', auth, authorize('admin'), upload.single('image'), foodItemController.createFoodItem);
router.put('/:id', auth, authorize('admin'), upload.single('image'), foodItemController.updateFoodItem);
router.delete('/:id', auth, authorize('admin'), foodItemController.deleteFoodItem);

module.exports = router;