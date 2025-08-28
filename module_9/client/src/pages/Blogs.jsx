import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogsService } from '../api/blogs';
import { useAuth } from '../context/AuthProvider';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogsService.getAllBlogs();
      setBlogs(response.data);
    } catch (err) {
      setError('Failed to fetch blogs');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Posts</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover stories, insights, and ideas from our community of writers.
          </p>
          {isLoggedIn && (
            <div className="mt-6">
              <Link
                to="/profile"
                className="btn btn-primary"
              >
                Write a Post
              </Link>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Blog Posts Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share your story!</p>
            {isLoggedIn ? (
              <Link to="/profile" className="btn btn-primary">
                Create Your First Post
              </Link>
            ) : (
              <Link to="/signup" className="btn btn-primary">
                Join to Start Writing
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div key={blog.id} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-600 font-semibold text-sm">
                        {blog.author?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {blog.author?.username || 'Unknown Author'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(blog.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="badge badge-primary">
                      {blog.category || 'General'}
                    </span>
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      Read More →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button (for future pagination) */}
        {blogs.length > 0 && (
          <div className="text-center mt-12">
            <button className="btn btn-secondary">
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;