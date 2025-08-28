const express = require('express');
const BlogQueries = require('../db/blogQueries');
const { authenticateToken, requireAdmin } = require('../middlewares/auth-middleware');
const validator = require('validator');

const router = express.Router();

// Public routes
router.get('/', async (req, res) => {
  try {
    const blogs = await BlogQueries.getAllBlogs();
    
    res.status(200).json({
      success: true,
      data: { blogs }
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validator.isInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    const blog = await BlogQueries.getBlogById(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { blog }
    });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Protected routes
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const author_id = req.user.id;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    if (!validator.isLength(title, { min: 5, max: 200 })) {
      return res.status(400).json({
        success: false,
        message: 'Title must be between 5 and 200 characters'
      });
    }

    if (!validator.isLength(content, { min: 50 })) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 50 characters long'
      });
    }

    const newBlog = await BlogQueries.createBlog(title, content, author_id);
    
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog: newBlog }
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own blogs unless they're admin
    if (req.user.role !== 'admin' && req.user.id != userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const blogs = await BlogQueries.getBlogsByAuthor(userId);
    
    res.status(200).json({
      success: true,
      data: { blogs }
    });
  } catch (error) {
    console.error('Get blogs by author error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!validator.isInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    // Check if blog exists and user owns it (or is admin)
    const existingBlog = await BlogQueries.getBlogById(id);
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (req.user.role !== 'admin' && existingBlog.author_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you can only edit your own blogs'
      });
    }

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    if (!validator.isLength(title, { min: 5, max: 200 })) {
      return res.status(400).json({
        success: false,
        message: 'Title must be between 5 and 200 characters'
      });
    }

    if (!validator.isLength(content, { min: 50 })) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 50 characters long'
      });
    }

    const updatedBlog = await BlogQueries.updateBlog(id, title, content);
    
    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog: updatedBlog }
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!validator.isInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    // Check if blog exists and user owns it (or is admin)
    const existingBlog = await BlogQueries.getBlogById(id);
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (req.user.role !== 'admin' && existingBlog.author_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you can only delete your own blogs'
      });
    }

    await BlogQueries.deleteBlog(id);
    
    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;