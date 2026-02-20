import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page" data-testid="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title" data-testid="hero-title">
            Welcome to TaskManager
          </h1>
          <p className="hero-description" data-testid="hero-description">
            Organize your tasks, boost your productivity, and achieve your goals with our intuitive task management system.
          </p>
          <div className="hero-actions">
            <Link 
              to="/register" 
              className="btn btn-primary btn-large"
              data-testid="get-started-button"
            >
              Get Started
            </Link>
            <Link 
              to="/login" 
              className="btn btn-secondary btn-large"
              data-testid="login-button"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title" data-testid="features-title">
            Features
          </h2>
          <div className="features-grid">
            <div className="feature-card" data-testid="feature-organize">
              <div className="feature-icon">📋</div>
              <h3>Organize Tasks</h3>
              <p>Create, edit, and organize your tasks with ease. Set priorities and due dates to stay on track.</p>
            </div>
            <div className="feature-card" data-testid="feature-track">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>Monitor your productivity with visual progress indicators and completion statistics.</p>
            </div>
            <div className="feature-card" data-testid="feature-collaborate">
              <div className="feature-icon">👥</div>
              <h3>Stay Focused</h3>
              <p>Filter and search through your tasks to focus on what matters most right now.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;