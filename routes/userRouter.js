const express = require('express');
const router = express.Router();
const userQueries = require('../db/userQueries');

// Create a new user
router.post('/', async (req, res) => {
  try {
    const user = await userQueries.createUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await userQueries.getAllUsers();
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await userQueries.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get user with blog count
router.get('/:id/stats', async (req, res) => {
  try {
    const userStats = await userQueries.getUserWithBlogsCount(req.params.id);
    if (!userStats) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    res.json({
      success: true,
      data: userStats
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Update user by ID
router.put('/:id', async (req, res) => {
  try {
    const user = await userQueries.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Update user password
router.patch('/:id/password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'New password is required' 
      });
    }
    
    const user = await userQueries.updateUserPassword(req.params.id, newPassword);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    res.json({
      success: true,
      message: 'Password updated successfully',
      data: user
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Delete user by ID
router.delete('/:id', async (req, res) => {
  try {
    const user = await userQueries.deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: user
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

module.exports = router;
