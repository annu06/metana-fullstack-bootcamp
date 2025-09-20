import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../components/LoginForm';

describe('LoginForm Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with all required fields', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    expect(screen.getByTestId('login-form-container')).toBeInTheDocument();
    expect(screen.getByTestId('form-title')).toHaveTextContent('Login');
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('register-link')).toBeInTheDocument();
  });

  test('displays error message when provided', () => {
    const errorMessage = 'Invalid credentials';
    render(<LoginForm onLogin={mockOnLogin} error={errorMessage} />);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('shows loading state when isLoading is true', () => {
    render(<LoginForm onLogin={mockOnLogin} isLoading={true} />);
    
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveTextContent('Logging in...');
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId('email-input')).toBeDisabled();
    expect(screen.getByTestId('password-input')).toBeDisabled();
  });

  test('validates required fields on submit', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
      expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
    });
    
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test('validates email format', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is invalid');
    });
    
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test('validates password length', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');
    
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toHaveTextContent('Password must be at least 6 characters');
    });
    
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test('clears field errors when user starts typing', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');
    
    // Trigger validation error
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });
    
    // Start typing to clear error
    fireEvent.change(emailInput, { target: { value: 'test@' } });
    
    expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
  });

  test('calls onLogin with correct data when form is valid', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('handles form submission with Enter key', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const form = screen.getByTestId('login-form');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('applies error styling to invalid fields', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      
      expect(emailInput).toHaveClass('error');
      expect(passwordInput).toHaveClass('error');
    });
  });

  test('register link has correct href', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const registerLink = screen.getByTestId('register-link');
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});