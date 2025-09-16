const express = require('express');
const {
    register,
    login,
    getMe,
    updateDetails,
    updatePassword
} = require('../controllers/auth');

const { protect, createRateLimit, validateInput } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts, please try again later');
const loginLimiter = createRateLimit(15 * 60 * 1000, 3, 'Too many login attempts, please try again later');

// Validation rules
const registerValidation = [
    { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 50 },
    { field: 'email', required: true, type: 'email' },
    { field: 'password', required: true, type: 'string', minLength: 6 }
];

const loginValidation = [
    { field: 'email', required: true, type: 'email' },
    { field: 'password', required: true, type: 'string' }
];

const updateDetailsValidation = [
    { field: 'name', required: false, type: 'string', minLength: 2, maxLength: 50 },
    { field: 'email', required: false, type: 'email' }
];

const updatePasswordValidation = [
    { field: 'currentPassword', required: true, type: 'string' },
    { field: 'newPassword', required: true, type: 'string', minLength: 6 }
];

// Routes
router.post('/register', authLimiter, validateInput(registerValidation), register);
router.post('/login', loginLimiter, validateInput(loginValidation), login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, validateInput(updateDetailsValidation), updateDetails);
router.put('/updatepassword', protect, validateInput(updatePasswordValidation), updatePassword);

module.exports = router;