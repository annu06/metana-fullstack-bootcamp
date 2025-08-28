import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About <span className="text-primary-600">BlogSpace</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BlogSpace is a modern, secure platform designed to empower writers and connect readers 
            through meaningful content and authentic storytelling.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              We believe that everyone has a story worth telling. BlogSpace provides a platform 
              where writers of all levels can share their thoughts, experiences, and expertise 
              with a global audience.
            </p>
            <p className="text-gray-600 mb-6">
              Our mission is to democratize publishing and create a space where authentic voices 
              can be heard, stories can be shared, and communities can be built around shared interests.
            </p>
            <Link to="/signup" className="btn btn-primary">
              Join Our Community
            </Link>
          </div>
          <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg p-8">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
                <div className="text-gray-600">Writers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary-600 mb-2">5000+</div>
                <div className="text-gray-600">Blog Posts</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-success-600 mb-2">10K+</div>
                <div className="text-gray-600">Readers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-warning-600 mb-2">50+</div>
                <div className="text-gray-600">Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose BlogSpace?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is protected with industry-standard security measures and authentication.
              </p>
            </div>
            
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast & Responsive</h3>
              <p className="text-gray-600">
                Built with modern technologies for optimal performance across all devices.
              </p>
            </div>
            
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Focused</h3>
              <p className="text-gray-600">
                Connect with like-minded writers and readers in a supportive environment.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-white rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Built with Modern Technology</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Frontend</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  React.js for dynamic user interfaces
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  Tailwind CSS for modern styling
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  React Router for seamless navigation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  Axios for API communication
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Backend</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></span>
                  Node.js with Express.js framework
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></span>
                  PostgreSQL database
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></span>
                  JWT authentication
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></span>
                  bcrypt password hashing
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Start Writing?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of writers who have already made BlogSpace their home for sharing stories and ideas.
          </p>
          <div className="space-x-4">
            <Link to="/signup" className="btn btn-primary px-8 py-3 text-lg">
              Get Started Today
            </Link>
            <Link to="/blogs" className="btn btn-secondary px-8 py-3 text-lg">
              Explore Blogs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;