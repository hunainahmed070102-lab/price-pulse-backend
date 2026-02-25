const express = require('express');
const router = express.Router();
const { login, changePassword, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/login', login);

// Protected routes (require authentication)
router.post('/change-password', authMiddleware, changePassword);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;