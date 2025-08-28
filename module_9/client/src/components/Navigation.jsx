import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const Navigation = () => {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', public: true },
    { path: '/blogs', label: 'Blogs', public: true },
    { path: '/about', label: 'About', public: true },
    { path: '/contact', label: 'Contact', public: true },
  ];

  const authLinks = [
    { path: '/profile', label: 'Profile', protected: true },
    { path: '/admin', label: 'Admin', admin: true },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center"
              onClick={closeMobileMenu}
            >
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">BlogPlatform</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Public Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Authenticated Links */}
            {isLoggedIn && (
              <>
                {authLinks.map((link) => {
                  if (link.admin && !isAdmin) return null;
                  if (link.protected && !isLoggedIn) return null;
                  
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(link.path)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </>
            )}

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">{user?.username}</span>
                    {isAdmin && (
                      <span className="badge badge-primary text-xs">Admin</span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-700 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/create-account"
                    className="btn-primary text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {/* Public Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Authenticated Links */}
            {isLoggedIn && (
              <>
                {authLinks.map((link) => {
                  if (link.admin && !isAdmin) return null;
                  if (link.protected && !isLoggedIn) return null;
                  
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={closeMobileMenu}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(link.path)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </>
            )}

            {/* Mobile Auth Section */}
            <div className="border-t border-gray-200 pt-4 pb-3">
              {isLoggedIn ? (
                <div className="px-3">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-base font-medium text-gray-900">{user?.username}</div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                      {isAdmin && (
                        <span className="badge badge-primary text-xs mt-1">Administrator</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="px-3 space-y-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/create-account"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;