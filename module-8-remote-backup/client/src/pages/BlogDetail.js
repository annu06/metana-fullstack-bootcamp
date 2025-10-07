import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI } from '../utils/api';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getById(id);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Blog post not found or failed to load.');
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
            <p className="mt-4 text-gray-600">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto mb-6">
              {error}
            </div>
            <Link 
              to="/blog"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            to="/blog"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Blog
          </Link>
        </div>

        {/* Blog Header */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          <div className="bg-gray-200 h-64 md:h-96 flex items-center justify-center">
            {blog.image_url ? (
              <img 
                src={blog.image_url} 
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500">Blog Post Image</span>
            )}
          </div>

          {/* Blog Content */}
          <div className="p-8 md:p-12">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <span>By {blog.author}</span>
              <span>•</span>
              <span>{formatDate(blog.created_at)}</span>
              {blog.updated_at && blog.updated_at !== blog.created_at && (
                <>
                  <span>•</span>
                  <span>Updated {formatDate(blog.updated_at)}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              {blog.title}
            </h1>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {blog.content}
              </div>
            </div>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Share this post</h3>
              <div className="flex space-x-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                  Share on Twitter
                </button>
                <button className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition duration-300">
                  Share on LinkedIn
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-300">
                  Copy Link
                </button>
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Author</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{blog.author}</h3>
                  <p className="text-gray-600 mt-2">
                    Passionate full-stack developer sharing insights about web development, 
                    technology trends, and programming best practices.
                  </p>
                  <div className="mt-3 space-x-4">
                    <Link 
                      to="/about"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Profile
                    </Link>
                    <Link 
                      to="/contact"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-8">More Blog Posts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* These would be dynamically loaded related posts */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <div className="bg-gray-200 h-40 flex items-center justify-center">
                  <span className="text-gray-500">Related Post {i}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Related Blog Post Title {i}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Brief excerpt from another interesting blog post...
                  </p>
                  <Link 
                    to={`/blog/${i + 10}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Enjoyed this post?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Subscribe to get notified about new blog posts, or check out my other work!
          </p>
          <div className="space-x-4">
            <Link 
              to="/blog"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
            >
              More Posts
            </Link>
            <Link 
              to="/projects"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300"
            >
              View Projects
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogDetail;