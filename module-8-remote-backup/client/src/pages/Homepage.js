import React from 'react';
import { Link } from 'react-router-dom';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to My Portfolio
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            I'm a full-stack developer passionate about creating amazing web experiences. 
            Explore my work, read my blog, and get in touch!
          </p>
          <div className="space-x-4">
            <Link 
              to="/projects" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
            >
              View My Work
            </Link>
            <Link 
              to="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">About Me</h2>
              <p className="text-gray-600 mb-6">
                I'm a passionate full-stack developer with expertise in modern web technologies. 
                I love building scalable applications and solving complex problems with clean, 
                efficient code.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-blue-600">Frontend</h3>
                  <p className="text-sm text-gray-600">React, JavaScript, CSS</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-purple-600">Backend</h3>
                  <p className="text-sm text-gray-600">Node.js, Express, Databases</p>
                </div>
              </div>
              <Link 
                to="/about" 
                className="text-blue-600 font-semibold hover:text-blue-800"
              >
                Learn More About Me →
              </Link>
            </div>
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Profile Image Placeholder</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Projects</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((project) => (
              <div key={project} className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                <div className="bg-gray-200 h-48 flex items-center justify-center">
                  <span className="text-gray-500">Project {project} Preview</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Project Title {project}</h3>
                  <p className="text-gray-600 mb-4">
                    Brief description of this amazing project and the technologies used to build it.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">React</span>
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">Node.js</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link 
              to="/projects" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Latest Blog Posts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((post) => (
              <article key={post} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                <div className="bg-gray-200 h-48 flex items-center justify-center">
                  <span className="text-gray-500">Blog Post {post} Image</span>
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-500 mb-2">January {post}, 2024</div>
                  <h3 className="text-xl font-semibold mb-3">Blog Post Title {post}</h3>
                  <p className="text-gray-600 mb-4">
                    This is a brief excerpt from the blog post that gives readers an idea of what to expect...
                  </p>
                  <Link 
                    to={`/blog/${post}`} 
                    className="text-blue-600 font-semibold hover:text-blue-800"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link 
              to="/blog" 
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-300"
            >
              View All Posts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;