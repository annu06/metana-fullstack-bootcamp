const express = require('express');
const AuthController = require('../controllers/auth');
const { authenticateToken } = require('../middlewares/auth-middleware');

const router = express.Router();

// Public routes
router.post('/create-account', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.get('/verify', authenticateToken, AuthController.verifyToken);

module.exports = router;