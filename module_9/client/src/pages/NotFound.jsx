import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const NotFound = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Icon */}
          <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          
          {/* Error Code */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          
          {/* Error Message */}
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you might have entered an incorrect URL.
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>
          
          {/* Additional Links */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">You might be looking for:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                to="/blogs"
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Blog Posts
              </Link>
              <Link
                to="/about"
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Contact
              </Link>
              {!isLoggedIn && (
                <>
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/create-account"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              {isLoggedIn && (
                <Link
                  to="/profile"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary-100 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-secondary-100 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-primary-200 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-secondary-200 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
      </div>
    </div>
  );
};

export default NotFound;