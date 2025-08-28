import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const blogsAPI = axios.create({
  baseURL: `${API_BASE_URL}/blogs`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
blogsAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
blogsAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Blogs API functions
export const blogsService = {
  // Get all blogs (public)
  getAllBlogs: async () => {
    try {
      const response = await blogsAPI.get('/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get blogs' };
    }
  },

  // Get blog by ID (public)
  getBlogById: async (blogId) => {
    try {
      const response = await blogsAPI.get(`/${blogId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get blog' };
    }
  },

  // Get blogs by user ID (protected)
  getBlogsByUser: async (userId) => {
    try {
      const response = await blogsAPI.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get user blogs' };
    }
  },

  // Create new blog (protected)
  createBlog: async (blogData) => {
    try {
      const response = await blogsAPI.post('/', blogData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create blog' };
    }
  },

  // Update blog (protected - owner or admin)
  updateBlog: async (blogId, blogData) => {
    try {
      const response = await blogsAPI.put(`/${blogId}`, blogData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update blog' };
    }
  },

  // Delete blog (protected - owner or admin)
  deleteBlog: async (blogId) => {
    try {
      const response = await blogsAPI.delete(`/${blogId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete blog' };
    }
  }
};

export default blogsService;