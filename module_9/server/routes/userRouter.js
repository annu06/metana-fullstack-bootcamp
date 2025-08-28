const express = require('express');
const UserQueries = require('../db/userQueries');
const { authenticateToken, requireAdmin, requireOwnershipOrAdmin } = require('../middlewares/auth-middleware');
const ContactController = require('../controllers/contact');

const router = express.Router();

// Contact routes (public)
router.post('/contact', ContactController.submitContact);
router.get('/contact-info', ContactController.getContactInfo);

// Protected user routes
router.get('/profile/:userId', authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
  try {
    const user = await UserQueries.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin only routes
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await UserQueries.getAllUsers();
    
    res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.put('/:userId/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin"'
      });
    }

    const updatedUser = await UserQueries.updateUserRole(userId, role);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.delete('/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (req.user.id == userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const deletedUser = await UserQueries.deleteUser(userId);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;