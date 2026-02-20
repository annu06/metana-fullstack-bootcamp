const express = require('express');
const router = express.Router();
const { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } = require('../db/blogQueries');

// GET /api/blogs - Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await getAllBlogs();
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/blogs/:id - Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/blogs - Create new blog
router.post('/', async (req, res) => {
  try {
    const newBlog = await createBlog(req.body);
    res.status(201).json(newBlog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/blogs/:id - Update blog
router.put('/:id', async (req, res) => {
  try {
    const updatedBlog = await updateBlog(req.params.id, req.body);
    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/blogs/:id - Delete blog
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteBlog(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;