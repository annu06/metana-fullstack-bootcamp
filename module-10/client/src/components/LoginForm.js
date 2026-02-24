import React, { useState } from 'react';

const LoginForm = ({ onLogin, isLoading = false, error = null }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onLogin(formData.email, formData.password);
    }
  };

  return (
    <div className="login-form-container" data-testid="login-form-container">
      <form onSubmit={handleSubmit} className="login-form" data-testid="login-form">
        <h2 className="form-title" data-testid="form-title">Login</h2>
        
        {error && (
          <div className="error-message" data-testid="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${formErrors.email ? 'error' : ''}`}
            data-testid="email-input"
            placeholder="Enter your email"
            disabled={isLoading}
          />
          {formErrors.email && (
            <span className="field-error" data-testid="email-error">
              {formErrors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`form-input ${formErrors.password ? 'error' : ''}`}
            data-testid="password-input"
            placeholder="Enter your password"
            disabled={isLoading}
          />
          {formErrors.password && (
            <span className="field-error" data-testid="password-error">
              {formErrors.password}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          data-testid="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="form-footer">
          <p>
            Don't have an account?{' '}
            <a href="/register" data-testid="register-link">
              Sign up here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;