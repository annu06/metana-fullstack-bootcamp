import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu} data-testid="navbar-brand">
          BlogApp
        </Link>

        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          data-testid="navbar-toggle"
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`} data-testid="navbar-menu">
          <div className="navbar-nav">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMenu}
              data-testid="home-link"
            >
              Home
            </Link>

            {user ? (
              // Authenticated user menu
              <>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                  onClick={closeMenu}
                  data-testid="dashboard-link"
                >
                  Dashboard
                </Link>
                
                <Link 
                  to="/create-blog" 
                  className={`nav-link ${isActive('/create-blog') ? 'active' : ''}`}
                  onClick={closeMenu}
                  data-testid="create-blog-link"
                >
                  Write
                </Link>
                
                <div className="nav-dropdown" data-testid="user-dropdown">
                  <button className="nav-dropdown-toggle" data-testid="user-menu-toggle">
                    <span className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                    <span className="user-name">{user.username}</span>
                    <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12">
                      <path d="M6 8L2 4h8l-4 4z" fill="currentColor" />
                    </svg>
                  </button>
                  
                  <div className="nav-dropdown-menu" data-testid="user-dropdown-menu">
                    <Link 
                      to="/profile" 
                      className="dropdown-link"
                      onClick={closeMenu}
                      data-testid="profile-link"
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="dropdown-link logout-btn"
                      data-testid="logout-button"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Guest user menu
              <>
                <Link 
                  to="/login" 
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                  onClick={closeMenu}
                  data-testid="login-link"
                >
                  Login
                </Link>
                
                <Link 
                  to="/register" 
                  className={`nav-link nav-link-primary ${isActive('/register') ? 'active' : ''}`}
                  onClick={closeMenu}
                  data-testid="register-link"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;