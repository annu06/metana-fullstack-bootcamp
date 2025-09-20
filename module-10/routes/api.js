const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user statistics
// @route   GET /api/stats
// @access  Private
router.get('/stats', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get task statistics
    const taskStats = await Task.getTaskStats(userId);
    const moodDistribution = await Task.getMoodDistribution(userId);
    
    // Get total tasks count
    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ user: userId, status: 'completed' });
    const overdueTasks = await Task.getOverdueTasks(userId);
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Get recent activity
    const recentTasks = await Task.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status mood updatedAt');
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalTasks,
          completedTasks,
          completionRate,
          overdueTasks: overdueTasks.length
        },
        taskStats,
        moodDistribution,
        recentActivity: recentTasks
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get application metrics
// @route   GET /api/metrics
// @access  Public (for monitoring)
router.get('/metrics', verifyToken, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalTasks = await Task.countDocuments();
    const tasksToday = await Task.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });
    
    // System metrics
    const metrics = {
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        environment: process.env.NODE_ENV || 'development'
      },
      application: {
        totalUsers,
        totalTasks,
        tasksToday,
        timestamp: new Date().toISOString()
      }
    };
    
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search tasks
// @route   GET /api/search
// @access  Private
router.get('/search', verifyToken, async (req, res, next) => {
  try {
    const { q, mood, status, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Build search query
    const searchQuery = {
      user: req.user.id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };
    
    if (mood) searchQuery.mood = mood;
    if (status) searchQuery.status = status;
    
    const tasks = await Task.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Task.countDocuments(searchQuery);
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      query: q,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
