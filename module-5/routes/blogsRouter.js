const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlogById,
  deleteBlogById,
  getBlogsByUserId
} = require('../db/blogQueries');
const { getUserById } = require('../db/userQueries');

// POST /api/blogs - Create a new blog
router.post('/', async (req, res) => {
  try {
    const { title, content, user } = req.body;

    // Verify that the user exists
    await getUserById(user);

    const blog = await createBlog({ title, content, user });
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    const statusCode = error.message === 'User not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: 'Error creating blog',
      error: error.message
    });
  }
});

// GET /api/blogs - Get all blogs
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let blogs;
    if (userId) {
      // Get blogs by specific user
      blogs = await getBlogsByUserId(userId);
    } else {
      // Get all blogs
      blogs = await getAllBlogs();
    }

    res.status(200).json({
      success: true,
      message: 'Blogs retrieved successfully',
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving blogs',
      error: error.message
    });
  }
});

// GET /api/blogs/:id - Get a specific blog
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await getBlogById(id);
    res.status(200).json({
      success: true,
      message: 'Blog retrieved successfully',
      data: blog
    });
  } catch (error) {
    const statusCode = error.message === 'Blog not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: 'Error retrieving blog',
      error: error.message
    });
  }
});

// PUT /api/blogs/:id - Update blog details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If user is being updated, verify that the user exists
    if (updateData.user) {
      await getUserById(updateData.user);
    }

    const blog = await updateBlogById(id, updateData);
    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (error) {
    let statusCode = 400;
    if (error.message === 'Blog not found') {
      statusCode = 404;
    } else if (error.message === 'User not found') {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      message: 'Error updating blog',
      error: error.message
    });
  }
});

// DELETE /api/blogs/:id - Delete a blog
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await deleteBlogById(id);
    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
      data: blog
    });
  } catch (error) {
    const statusCode = error.message === 'Blog not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: 'Error deleting blog',
      error: error.message
    });
  }
});

module.exports = router;