const Blog = require('../models/Blog');

// Create a new blog
const createBlog = async (blogData) => {
  try {
    const blog = new Blog(blogData);
    const savedBlog = await blog.save();
    // Populate user information
    const populatedBlog = await Blog.findById(savedBlog._id).populate('user', 'name email');
    return populatedBlog;
  } catch (error) {
    throw error;
  }
};

// Get all blogs
const getAllBlogs = async () => {
  try {
    const blogs = await Blog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    return blogs;
  } catch (error) {
    throw error;
  }
};

// Get blog by ID
const getBlogById = async (blogId) => {
  try {
    const blog = await Blog.findById(blogId).populate('user', 'name email');
    if (!blog) {
      throw new Error('Blog not found');
    }
    return blog;
  } catch (error) {
    throw error;
  }
};

// Update blog by ID
const updateBlogById = async (blogId, updateData) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    if (!blog) {
      throw new Error('Blog not found');
    }
    return blog;
  } catch (error) {
    throw error;
  }
};

// Delete blog by ID
const deleteBlogById = async (blogId) => {
  try {
    const blog = await Blog.findByIdAndDelete(blogId).populate('user', 'name email');
    if (!blog) {
      throw new Error('Blog not found');
    }
    return blog;
  } catch (error) {
    throw error;
  }
};

// Get blogs by user ID
const getBlogsByUserId = async (userId) => {
  try {
    const blogs = await Blog.find({ user: userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    return blogs;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlogById,
  deleteBlogById,
  getBlogsByUserId
};