// userRouter.js - User routes
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');

// Protected route: any logged-in user
router.get('/profile', authMiddleware, (req, res) => {
	res.json({ message: 'This is a protected profile route', user: req.user });
});

// Admin-only route
router.get('/admin', authMiddleware, (req, res) => {
	if (req.user.role !== 'admin') {
		return res.status(403).json({ error: 'Admins only' });
	}
	res.json({ message: 'Welcome, admin!', user: req.user });
});

module.exports = router;
