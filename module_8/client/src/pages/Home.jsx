import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to My Portfolio
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Full Stack Developer & Creative Problem Solver
            </p>
            <p className="text-lg mb-10 max-w-3xl mx-auto text-primary-50">
              I create innovative web applications and share my journey through code and writing. 
              Passionate about modern technologies and clean, efficient solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/projects"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                View My Work
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About Me
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                I'm a passionate full-stack developer with expertise in modern web technologies. 
                I love creating user-friendly applications that solve real-world problems.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                With experience in React, Node.js, and various databases, I bring ideas to life 
                through clean, efficient code and thoughtful design.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200"
              >
                Learn More About Me
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills & Technologies</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Frontend</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>React.js</li>
                    <li>JavaScript/TypeScript</li>
                    <li>Tailwind CSS</li>
                    <li>HTML5 & CSS3</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Backend</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Node.js</li>
                    <li>Express.js</li>
                    <li>PostgreSQL</li>
                    <li>RESTful APIs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Projects
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Here are some of my recent projects that showcase my skills and passion for development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project Card 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">E-Commerce Platform</h3>
                <p className="text-gray-600 mb-4">
                  A full-stack e-commerce solution with React frontend and Node.js backend.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">React</span>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">Node.js</span>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">PostgreSQL</span>
                </div>
                <a href="#" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200">
                  View Project →
                </a>
              </div>
            </div>

            {/* Project Card 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-r from-green-400 to-green-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Management App</h3>
                <p className="text-gray-600 mb-4">
                  A collaborative task management application with real-time updates.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">React</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Socket.io</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">MongoDB</span>
                </div>
                <a href="#" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200">
                  View Project →
                </a>
              </div>
            </div>

            {/* Project Card 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Weather Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  A responsive weather application with location-based forecasts.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">JavaScript</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">API</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">CSS3</span>
                </div>
                <a href="#" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200">
                  View Project →
                </a>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/projects"
              className="inline-flex items-center bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
            >
              View All Projects
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Blogs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Blog Posts
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              I share my thoughts, experiences, and tutorials about web development and technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Blog Card 1 */}
            <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span>March 15, 2024</span>
                  <span className="mx-2">•</span>
                  <span>5 min read</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Getting Started with React Hooks
                </h3>
                <p className="text-gray-600 mb-4">
                  Learn how to use React Hooks to manage state and side effects in functional components.
                </p>
                <Link
                  to="/blogs/1"
                  className="text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200"
                >
                  Read More →
                </Link>
              </div>
            </article>

            {/* Blog Card 2 */}
            <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span>March 10, 2024</span>
                  <span className="mx-2">•</span>
                  <span>7 min read</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Building RESTful APIs with Node.js
                </h3>
                <p className="text-gray-600 mb-4">
                  A comprehensive guide to creating robust and scalable APIs using Node.js and Express.
                </p>
                <Link
                  to="/blogs/2"
                  className="text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200"
                >
                  Read More →
                </Link>
              </div>
            </article>

            {/* Blog Card 3 */}
            <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-r from-teal-400 to-teal-600"></div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span>March 5, 2024</span>
                  <span className="mx-2">•</span>
                  <span>4 min read</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  CSS Grid vs Flexbox: When to Use What
                </h3>
                <p className="text-gray-600 mb-4">
                  Understanding the differences and use cases for CSS Grid and Flexbox layouts.
                </p>
                <Link
                  to="/blogs/3"
                  className="text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200"
                >
                  Read More →
                </Link>
              </div>
            </article>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/blogs"
              className="inline-flex items-center bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
            >
              View All Posts
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Let's Work Together
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Have a project in mind? I'd love to hear about it and discuss how we can bring your ideas to life.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            Get In Touch
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;