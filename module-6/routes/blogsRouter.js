const express = require('express');
const router = express.Router();
const {
  getAllBlogs,
  getPublishedBlogs,
  getBlogById,
  getBlogsByAuthor,
  createBlog,
  updateBlog,
  deleteBlog,
  searchBlogs
} = require('../db/blogQueries');

// GET /api/blogs - Get all blogs or published blogs
router.get('/', async (req, res) => {
  try {
    const { published, author, search } = req.query;
    
    let blogs;
    
    if (search) {
      // Search blogs by title or content
      blogs = await searchBlogs(search);
    } else if (author) {
      // Get blogs by specific author
      if (isNaN(author)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid author ID'
        });
      }
      blogs = await getBlogsByAuthor(parseInt(author));
    } else if (published === 'true') {
      // Get only published blogs
      blogs = await getPublishedBlogs();
    } else {
      // Get all blogs
      blogs = await getAllBlogs();
    }
    
    res.json({
      success: true,
      data: blogs,
      message: 'Blogs retrieved successfully',
      count: blogs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/blogs/:id - Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }
    
    const blog = await getBlogById(parseInt(id));
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      data: blog,
      message: 'Blog retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/blogs - Create a new blog
router.post('/', async (req, res) => {
  try {
    const { title, content, author_id, published } = req.body;
    
    // Validation
    if (!title || !content || !author_id) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and author_id are required'
      });
    }
    
    if (isNaN(author_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid author ID'
      });
    }
    
    const blogData = {
      title: title.trim(),
      content: content.trim(),
      author_id: parseInt(author_id),
      published: published === true || published === 'true'
    };
    
    const newBlog = await createBlog(blogData);
    
    res.status(201).json({
      success: true,
      data: newBlog,
      message: 'Blog created successfully'
    });
  } catch (error) {
    if (error.message === 'Author not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
});

// PUT /api/blogs/:id - Update blog
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, published } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }
    
    const blogData = {
      title: title?.trim(),
      content: content?.trim(),
      published: published !== undefined ? (published === true || published === 'true') : undefined
    };
    
    const updatedBlog = await updateBlog(parseInt(id), blogData);
    
    res.json({
      success: true,
      data: updatedBlog,
      message: 'Blog updated successfully'
    });
  } catch (error) {
    if (error.message === 'Blog not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
});

// PATCH /api/blogs/:id/publish - Toggle blog publish status
router.patch('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }
    
    // Get current blog to toggle its published status
    const currentBlog = await getBlogById(parseInt(id));
    
    if (!currentBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    const updatedBlog = await updateBlog(parseInt(id), {
      published: !currentBlog.published
    });
    
    res.json({
      success: true,
      data: updatedBlog,
      message: `Blog ${updatedBlog.published ? 'published' : 'unpublished'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/blogs/:id - Delete blog
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }
    
    const deletedBlog = await deleteBlog(parseInt(id));
    
    res.json({
      success: true,
      data: deletedBlog,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Blog not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
});

module.exports = router;