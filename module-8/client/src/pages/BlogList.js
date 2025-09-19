import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../utils/api';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getAll();
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
              {error}
            </div>
            <button 
              onClick={fetchBlogs}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Thoughts, tutorials, and insights about web development, technology, and my journey as a developer.
          </p>
        </div>

        {/* Blog Posts Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">No Blog Posts Yet</h3>
              <p className="text-gray-600">
                Check back soon for new content! In the meantime, feel free to explore my projects or get in touch.
              </p>
              <div className="mt-6 space-x-4">
                <Link 
                  to="/projects" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  View Projects
                </Link>
                <Link 
                  to="/contact" 
                  className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition duration-300"
                >
                  Contact Me
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Post (First Post) */}
            {blogs.length > 0 && (
              <section className="mb-16">
                <h2 className="text-2xl font-semibold mb-8">Featured Post</h2>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="lg:flex">
                    <div className="lg:w-1/2">
                      <div className="bg-gray-200 h-64 lg:h-full flex items-center justify-center">
                        {blogs[0].image_url ? (
                          <img 
                            src={blogs[0].image_url} 
                            alt={blogs[0].title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500">Featured Blog Image</span>
                        )}
                      </div>
                    </div>
                    <div className="lg:w-1/2 p-8">
                      <div className="text-sm text-blue-600 font-medium mb-2">Featured Post</div>
                      <h3 className="text-3xl font-bold mb-4">{blogs[0].title}</h3>
                      <div className="text-sm text-gray-500 mb-4">
                        By {blogs[0].author} • {formatDate(blogs[0].created_at)}
                      </div>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {blogs[0].excerpt || blogs[0].content.substring(0, 200) + '...'}
                      </p>
                      <Link 
                        to={`/blog/${blogs[0].id}`}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                      >
                        Read Full Article
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Other Posts */}
            {blogs.length > 1 && (
              <section>
                <h2 className="text-2xl font-semibold mb-8">Recent Posts</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogs.slice(1).map((blog) => (
                    <article key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                      <div className="bg-gray-200 h-48 flex items-center justify-center">
                        {blog.image_url ? (
                          <img 
                            src={blog.image_url} 
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500">Blog Image</span>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="text-sm text-gray-500 mb-2">
                          {formatDate(blog.created_at)}
                        </div>
                        <h3 className="text-xl font-bold mb-3 line-clamp-2">{blog.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {blog.excerpt || blog.content.substring(0, 120) + '...'}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">By {blog.author}</span>
                          <Link 
                            to={`/blog/${blog.id}`}
                            className="text-blue-600 font-semibold hover:text-blue-800 transition duration-300"
                          >
                            Read More →
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Newsletter Subscription */}
        <section className="mt-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Subscribe to get notified about new blog posts and updates. No spam, just quality content!
          </p>
          <div className="flex max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg text-gray-800"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-r-lg font-semibold hover:bg-gray-100 transition duration-300">
              Subscribe
            </button>
          </div>
        </section>

        {/* Categories/Tags Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Explore Topics</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['React', 'JavaScript', 'Node.js', 'Web Development', 'Tutorial', 'Career'].map((tag) => (
              <span 
                key={tag}
                className="bg-white text-gray-700 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition duration-300 cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogList;