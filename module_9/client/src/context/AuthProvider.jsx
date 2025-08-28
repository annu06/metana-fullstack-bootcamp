import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/auth';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getUser();

        if (storedToken && storedUser) {
          // Verify token is still valid
          try {
            await authService.verifyToken();
            setToken(storedToken);
            setUser(storedUser);
          } catch (error) {
            // Token is invalid, clear stored data
            authService.clearAuthData();
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        const { token: newToken, user: newUser } = response.data;
        setToken(newToken);
        setUser(newUser);
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      if (response.success) {
        const { token: newToken, user: newUser } = response.data;
        setToken(newToken);
        setUser(newUser);
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Update user data
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Computed properties
  const isLoggedIn = !!(token && user);
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  // Context value
  const value = {
    // State
    user,
    token,
    loading,
    error,
    
    // Computed properties
    isLoggedIn,
    isAdmin,
    isUser,
    
    // Functions
    login,
    register,
    logout,
    updateUser,
    clearError,
    
    // User info helpers
    getUserId: () => user?.id,
    getUsername: () => user?.username,
    getUserEmail: () => user?.email,
    getUserRole: () => user?.role,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;