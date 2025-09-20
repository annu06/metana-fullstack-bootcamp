import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" data-testid="nav-logo">
          TaskManager
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" data-testid="dashboard-link">
                Dashboard
              </Link>
              <span className="nav-user" data-testid="nav-user">
                Welcome, {user.name}
              </span>
              <button 
                onClick={handleLogout} 
                className="nav-button logout"
                data-testid="logout-button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" data-testid="login-link">
                Login
              </Link>
              <Link to="/register" className="nav-link" data-testid="register-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;