const express = require('express');
const router = express.Router();
const blogQueries = require('../db/blogQueries');

// Create a new blog
router.post('/', async (req, res) => {
  try {
    const blog = await blogQueries.createBlog(req.body);
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await blogQueries.getAllBlogs();
    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get blog statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await blogQueries.getBlogStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Search blogs
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ 
        success: false,
        error: 'Search query is required' 
      });
    }
    
    const blogs = await blogQueries.searchBlogs(q);
    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get blogs by author
router.get('/author/:authorId', async (req, res) => {
  try {
    const blogs = await blogQueries.getBlogsByAuthor(req.params.authorId);
    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await blogQueries.getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        error: 'Blog not found' 
      });
    }
    res.json({
      success: true,
      data: blog
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Update blog by ID
router.put('/:id', async (req, res) => {
  try {
    const blog = await blogQueries.updateBlog(req.params.id, req.body);
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        error: 'Blog not found' 
      });
    }
    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Delete blog by ID
router.delete('/:id', async (req, res) => {
  try {
    const blog = await blogQueries.deleteBlog(req.params.id);
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        error: 'Blog not found' 
      });
    }
    res.json({
      success: true,
      message: 'Blog deleted successfully',
      data: blog
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

module.exports = router;
