const express = require('express');
const router = express.Router();
const blogQueries = require('../db/blogQueries');

// Create a new blog
router.post('/', async (req, res) => {
  try {
    const blog = await blogQueries.createBlog(req.body);
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await blogQueries.getAllBlogs();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await blogQueries.getBlogById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update blog by ID
router.put('/:id', async (req, res) => {
  try {
    const blog = await blogQueries.updateBlog(req.params.id, req.body);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete blog by ID
router.delete('/:id', async (req, res) => {
  try {
    const blog = await blogQueries.deleteBlog(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
