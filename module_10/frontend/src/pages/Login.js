import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    // Redirect to dashboard after successful login
    navigate('/dashboard');
  };

  return (
    <div className="login-page" data-testid="login-page">
      <div className="login-container">
        <div className="login-content">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue your blogging journey.</p>
          </div>
          
          <LoginForm onSuccess={handleLoginSuccess} />
          
          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="register-link" data-testid="register-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
        
        <div className="login-sidebar">
          <div className="sidebar-content">
            <h2>Join Our Community</h2>
            <div className="features">
              <div className="feature">
                <div className="feature-icon">✍️</div>
                <h3>Share Your Stories</h3>
                <p>Write and publish your thoughts, experiences, and insights with our easy-to-use editor.</p>
              </div>
              
              <div className="feature">
                <div className="feature-icon">👥</div>
                <h3>Connect with Writers</h3>
                <p>Discover amazing content from fellow writers and build meaningful connections.</p>
              </div>
              
              <div className="feature">
                <div className="feature-icon">📈</div>
                <h3>Track Your Progress</h3>
                <p>Monitor your writing journey with detailed analytics and engagement metrics.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;