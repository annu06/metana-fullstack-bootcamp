import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Blog API functions
export const blogAPI = {
  // Get all blogs
  getAll: () => api.get('/blogs'),
  
  // Get blog by ID
  getById: (id) => api.get(`/blogs/${id}`),
  
  // Create new blog
  create: (blogData) => api.post('/blogs', blogData),
  
  // Update blog
  update: (id, blogData) => api.put(`/blogs/${id}`, blogData),
  
  // Delete blog
  delete: (id) => api.delete(`/blogs/${id}`),
};

// User API functions
export const userAPI = {
  // Get all users
  getAll: () => api.get('/users'),
  
  // Get user by ID
  getById: (id) => api.get(`/users/${id}`),
  
  // Register user
  register: (userData) => api.post('/users/register', userData),
  
  // Login user
  login: (credentials) => api.post('/users/login', credentials),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;