import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';

// Mock the auth context
const mockLogout = jest.fn();

const MockAuthProvider = ({ children, user = null }) => {
  const mockContextValue = {
    user,
    logout: mockLogout,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn()
  };

  return (
    <div data-testid="mock-auth-provider">
      {React.cloneElement(children, { mockAuth: mockContextValue })}
    </div>
  );
};

// Custom render function with router and auth context
const renderWithProviders = (ui, { user = null } = {}) => {
  const MockedNavbar = () => {
    const { useAuth } = require('../context/AuthContext');
    const originalUseAuth = useAuth;
    
    // Mock useAuth hook
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockReturnValue({
      user,
      logout: mockLogout,
      isLoading: false
    });

    return (
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
  };

  return render(<MockedNavbar />);
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders navbar with logo', () => {
    renderWithProviders(<Navbar />);
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('nav-logo')).toBeInTheDocument();
    expect(screen.getByText('TaskManager')).toBeInTheDocument();
  });

  test('shows login and register links when user is not authenticated', () => {
    renderWithProviders(<Navbar />, { user: null });
    
    expect(screen.getByTestId('login-link')).toBeInTheDocument();
    expect(screen.getByTestId('register-link')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
  });

  test('shows dashboard link, user greeting, and logout button when user is authenticated', () => {
    const mockUser = { name: 'John Doe', email: 'john@example.com' };
    renderWithProviders(<Navbar />, { user: mockUser });
    
    expect(screen.getByTestId('dashboard-link')).toBeInTheDocument();
    expect(screen.getByTestId('nav-user')).toBeInTheDocument();
    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    expect(screen.queryByTestId('login-link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('register-link')).not.toBeInTheDocument();
  });

  test('calls logout function when logout button is clicked', async () => {
    const mockUser = { name: 'John Doe', email: 'john@example.com' };
    renderWithProviders(<Navbar />, { user: mockUser });
    
    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  test('logo links to home page', () => {
    renderWithProviders(<Navbar />);
    
    const logoLink = screen.getByTestId('nav-logo');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  test('login link navigates to login page', () => {
    renderWithProviders(<Navbar />, { user: null });
    
    const loginLink = screen.getByTestId('login-link');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('register link navigates to register page', () => {
    renderWithProviders(<Navbar />, { user: null });
    
    const registerLink = screen.getByTestId('register-link');
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('dashboard link navigates to dashboard page', () => {
    const mockUser = { name: 'John Doe', email: 'john@example.com' };
    renderWithProviders(<Navbar />, { user: mockUser });
    
    const dashboardLink = screen.getByTestId('dashboard-link');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });
});