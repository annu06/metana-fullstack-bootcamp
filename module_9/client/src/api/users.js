import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const usersAPI = axios.create({
  baseURL: `${API_BASE_URL}/users`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
usersAPI.interceptors.request.use(
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
usersAPI.interceptors.response.use(
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

// Users API functions
export const usersService = {
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await usersAPI.get('/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get users' };
    }
  },

  // Get user profile by ID
  getUserProfile: async (userId) => {
    try {
      const response = await usersAPI.get(`/profile/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get user profile' };
    }
  },

  // Update user role (admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await usersAPI.put(`/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update user role' };
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await usersAPI.delete(`/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete user' };
    }
  },

  // Submit contact form
  submitContact: async (contactData) => {
    try {
      const response = await usersAPI.post('/contact', contactData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to submit contact form' };
    }
  },

  // Get contact information
  getContactInfo: async () => {
    try {
      const response = await usersAPI.get('/contact-info');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get contact info' };
    }
  }
};

export default usersService;