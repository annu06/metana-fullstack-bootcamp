import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const Home = () => {
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">BlogSpace</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern platform for sharing your thoughts, stories, and ideas with the world.
            Join our community of writers and readers.
          </p>
          
          {!isLoggedIn ? (
            <div className="space-x-4">
              <Link
                to="/signup"
                className="btn btn-primary px-8 py-3 text-lg"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary px-8 py-3 text-lg"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Welcome back, {user?.username}!
              </h2>
              <Link
                to="/blogs"
                className="btn btn-primary px-8 py-3 text-lg"
              >
                Explore Blogs
              </Link>
              <Link
                to="/profile"
                className="btn btn-secondary px-8 py-3 text-lg"
              >
                My Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Write & Share</h3>
            <p className="text-gray-600">Create and publish your blog posts with our intuitive editor.</p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect</h3>
            <p className="text-gray-600">Join a community of passionate writers and readers.</p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Grow</h3>
            <p className="text-gray-600">Build your audience and improve your writing skills.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;