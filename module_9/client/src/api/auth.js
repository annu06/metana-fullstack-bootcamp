import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
authAPI.interceptors.request.use(
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

// Add response interceptor to handle token expiration
authAPI.interceptors.response.use(
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

// Authentication API functions
export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await authAPI.post('/create-account', userData);
      
      if (response.data.success && response.data.data.token) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await authAPI.post('/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Login failed' };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await authAPI.get('/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get profile' };
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await authAPI.get('/verify');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Token verification failed' };
    }
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Get stored user
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getUser();
    return user?.role === 'admin';
  },

  // Set auth data (used by context)
  setAuthData: (token, user) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

export default authService;