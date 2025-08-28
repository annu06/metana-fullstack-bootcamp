import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Test component to access auth context
const TestComponent = () => {
  const { user, login, register, logout, updateProfile, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.username : 'no-user'}</div>
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'password')}>Login</button>
      <button data-testid="register-btn" onClick={() => register('testuser', 'test@example.com', 'password')}>Register</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
      <button data-testid="update-profile-btn" onClick={() => updateProfile({ username: 'newuser' })}>Update Profile</button>
    </div>
  );
};

const renderWithAuthProvider = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockedAxios.defaults = { headers: { common: {} } };
  });

  describe('Initial State', () => {
    it('should initialize with no user and not loading', () => {
      renderWithAuthProvider(<TestComponent />);
      
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    it('should load user from localStorage if token exists', async () => {
      const mockUser = global.testUtils.mockUser;
      const mockToken = 'mock-token';
      
      localStorage.setItem('token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: { user: mockUser }
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.username);
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/profile');
      expect(mockedAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });

    it('should handle invalid token in localStorage', async () => {
      localStorage.setItem('token', 'invalid-token');
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401 }
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });

      expect(localStorage.getItem('token')).toBeNull();
      expect(mockedAxios.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      const mockUser = global.testUtils.mockUser;
      const mockToken = 'mock-token';
      
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          user: mockUser,
          token: mockToken
        }
      });

      renderWithAuthProvider(<TestComponent />);

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.username);
      });

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(mockedAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });

    it('should handle login failure', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid credentials' }
        }
      });

      renderWithAuthProvider(<TestComponent />);

      await expect(async () => {
        await act(async () => {
          screen.getByTestId('login-btn').click();
        });
      }).rejects.toEqual({
        response: {
          data: { message: 'Invalid credentials' }
        }
      });

      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should show loading state during login', async () => {
      let resolveLogin;
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve;
      });
      
      mockedAxios.post.mockReturnValueOnce(loginPromise);

      renderWithAuthProvider(<TestComponent />);

      act(() => {
        screen.getByTestId('login-btn').click();
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      await act(async () => {
        resolveLogin({
          data: {
            user: global.testUtils.mockUser,
            token: 'mock-token'
          }
        });
        await loginPromise;
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  describe('Register', () => {
    it('should register successfully', async () => {
      const mockUser = global.testUtils.mockUser;
      const mockToken = 'mock-token';
      
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          user: mockUser,
          token: mockToken
        }
      });

      renderWithAuthProvider(<TestComponent />);

      await act(async () => {
        screen.getByTestId('register-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.username);
      });

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      });
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('should handle registration failure', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Email already exists' }
        }
      });

      renderWithAuthProvider(<TestComponent />);

      await expect(async () => {
        await act(async () => {
          screen.getByTestId('register-btn').click();
        });
      }).rejects.toEqual({
        response: {
          data: { message: 'Email already exists' }
        }
      });

      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const mockUser = global.testUtils.mockUser;
      const mockToken = 'mock-token';
      
      // Setup logged in state
      localStorage.setItem('token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: { user: mockUser }
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.username);
      });

      // Logout
      act(() => {
        screen.getByTestId('logout-btn').click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(localStorage.getItem('token')).toBeNull();
      expect(mockedAxios.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('Update Profile', () => {
    it('should update profile successfully', async () => {
      const mockUser = global.testUtils.mockUser;
      const updatedUser = { ...mockUser, username: 'newuser' };
      const mockToken = 'mock-token';
      
      // Setup logged in state
      localStorage.setItem('token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: { user: mockUser }
      });
      mockedAxios.put.mockResolvedValueOnce({
        data: { user: updatedUser }
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.username);
      });

      await act(async () => {
        screen.getByTestId('update-profile-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('newuser');
      });

      expect(mockedAxios.put).toHaveBeenCalledWith('/api/auth/profile', {
        username: 'newuser'
      });
    });

    it('should handle profile update failure', async () => {
      const mockUser = global.testUtils.mockUser;
      const mockToken = 'mock-token';
      
      // Setup logged in state
      localStorage.setItem('token', mockToken);
      mockedAxios.get.mockResolvedValueOnce({
        data: { user: mockUser }
      });
      mockedAxios.put.mockRejectedValueOnce({
        response: {
          data: { message: 'Username already taken' }
        }
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.username);
      });

      await expect(async () => {
        await act(async () => {
          screen.getByTestId('update-profile-btn').click();
        });
      }).rejects.toEqual({
        response: {
          data: { message: 'Username already taken' }
        }
      });

      // User should remain unchanged
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.username);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      localStorage.setItem('token', 'mock-token');
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle server errors during authentication', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      });

      renderWithAuthProvider(<TestComponent />);

      await expect(async () => {
        await act(async () => {
          screen.getByTestId('login-btn').click();
        });
      }).rejects.toEqual({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      });
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const TestComponentOutsideProvider = () => {
        useAuth();
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponentOutsideProvider />);
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });
  });
});