import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear auth error when user starts typing
    if (authError) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const result = await register(formData.username, formData.email, formData.password);
      
      if (result.success) {
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page" data-testid="register-page">
      <div className="register-container">
        <div className="register-content">
          <div className="register-header">
            <h1>Create Account</h1>
            <p>Join our community and start sharing your stories with the world.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="register-form" data-testid="register-form">
            {authError && (
              <div className="error-message" data-testid="auth-error">
                {authError}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Choose a username"
                data-testid="username-input"
                disabled={isSubmitting}
              />
              {errors.username && (
                <span className="field-error" data-testid="username-error">
                  {errors.username}
                </span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                data-testid="email-input"
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className="field-error" data-testid="email-error">
                  {errors.email}
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
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Create a password"
                data-testid="password-input"
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className="field-error" data-testid="password-error">
                  {errors.password}
                </span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                data-testid="confirm-password-input"
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <span className="field-error" data-testid="confirm-password-error">
                  {errors.confirmPassword}
                </span>
              )}
            </div>
            
            <button
              type="submit"
              className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
              data-testid="submit-button"
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="login-link" data-testid="login-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
        
        <div className="register-sidebar">
          <div className="sidebar-content">
            <h2>Why Join Us?</h2>
            <div className="benefits">
              <div className="benefit">
                <div className="benefit-icon">🚀</div>
                <h3>Get Started Quickly</h3>
                <p>Create your account in seconds and start publishing your first blog post immediately.</p>
              </div>
              
              <div className="benefit">
                <div className="benefit-icon">🎨</div>
                <h3>Beautiful Editor</h3>
                <p>Use our intuitive editor to create stunning blog posts with rich formatting and media support.</p>
              </div>
              
              <div className="benefit">
                <div className="benefit-icon">🌟</div>
                <h3>Build Your Audience</h3>
                <p>Grow your readership and engage with a community of passionate writers and readers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;