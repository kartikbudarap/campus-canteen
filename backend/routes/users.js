const express = require('express');
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, upload.single('avatar'), userController.updateProfile);
router.put('/change-password', auth, userController.changePassword);

module.exports = router;