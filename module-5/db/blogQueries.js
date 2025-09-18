const Blog = require('../models/Blog');

// Create a new blog
async function createBlog(data) {
  const blog = new Blog(data);
  return await blog.save();
}

// Get all blogs
async function getAllBlogs() {
  return await Blog.find().populate('user', 'name email');
}

// Get blog by ID
async function getBlogById(id) {
  return await Blog.findById(id).populate('user', 'name email');
}

// Update blog by ID
async function updateBlog(id, data) {
  return await Blog.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

// Delete blog by ID
async function deleteBlog(id) {
  return await Blog.findByIdAndDelete(id);
}

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
