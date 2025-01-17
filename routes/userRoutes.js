const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/forgot-password', userController.forgetPassword);
router.post('/reset-password', userController.resetPassword);

module.exports = router; 