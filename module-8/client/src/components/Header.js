import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Projects', href: '/projects' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="custom-header">
      <nav className="custom-nav">
        <div className="custom-nav-row">
          {/* Logo */}
          <Link to="/" className="custom-logo">
            YourName
          </Link>
          <div className="custom-nav-links">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`custom-nav-link${isActive(item.href) ? ' active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
            <Link to="/contact" className="custom-nav-cta">Get In Touch</Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;