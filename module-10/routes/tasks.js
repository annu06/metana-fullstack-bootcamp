const express = require('express');
const Task = require('../models/Task');
const { verifyToken, createRateLimit } = require('../middleware/auth');
const { clearCache } = require('../middleware/cache');

const router = express.Router();

// Rate limiter
const taskLimiter = createRateLimit(15 * 60 * 1000, 50, 'Too many task requests');

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { mood, status, priority, category, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    if (mood) query.mood = mood;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    // Execute query with pagination
    const tasks = await Task.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Task.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
router.post('/', verifyToken, taskLimiter, async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    
    const task = await Task.create(req.body);
    
    // Clear user cache
    clearCache(`tasks_${req.user.id}`);
    
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', verifyToken, taskLimiter, async (req, res, next) => {
  try {
    let task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    // Clear user cache
    clearCache(`tasks_${req.user.id}`);
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    await task.deleteOne();
    
    // Clear user cache
    clearCache(`tasks_${req.user.id}`);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get tasks by mood
// @route   GET /api/tasks/mood/:mood
// @access  Private
router.get('/mood/:mood', verifyToken, async (req, res, next) => {
  try {
    const tasks = await Task.getTasksByMood(req.user.id, req.params.mood);
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get overdue tasks
// @route   GET /api/tasks/overdue
// @access  Private
router.get('/overdue', verifyToken, async (req, res, next) => {
  try {
    const tasks = await Task.getOverdueTasks(req.user.id);
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
