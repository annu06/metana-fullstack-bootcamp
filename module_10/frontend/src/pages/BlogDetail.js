import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './BlogDetail.css';

const BlogDetail = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/blogs/${id}`);
      setBlog(response.data.blog);
    } catch (error) {
      console.error('Error fetching blog:', error);
      if (error.response?.status === 404) {
        setError('Blog post not found.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this blog post.');
      } else {
        setError('Failed to load blog post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/edit-blog/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/blogs/${id}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting blog:', error);
      setError('Failed to delete blog post. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAuthor = user && blog && user._id === blog.author._id;

  if (loading) {
    return (
      <div className="blog-detail-loading" data-testid="blog-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading blog post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-detail-error" data-testid="blog-detail-error">
        <div className="error-content">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchBlog} className="retry-btn">
              Try Again
            </button>
            <Link to="/" className="home-btn">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-error" data-testid="blog-not-found">
        <div className="error-content">
          <h2>Blog post not found</h2>
          <p>The blog post you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="home-btn">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail" data-testid="blog-detail">
      <div className="blog-detail-container">
        <div className="blog-header">
          <div className="blog-meta">
            <Link to="/" className="back-link" data-testid="back-link">
              ← Back to Blogs
            </Link>
            
            {blog.status === 'draft' && (
              <span className="draft-badge" data-testid="draft-badge">
                Draft
              </span>
            )}
          </div>
          
          <h1 className="blog-title" data-testid="blog-title">
            {blog.title}
          </h1>
          
          <div className="blog-info">
            <div className="author-info">
              <span className="author-name" data-testid="author-name">
                By {blog.author.username}
              </span>
              <span className="publish-date" data-testid="publish-date">
                {formatDate(blog.publishedAt || blog.createdAt)}
              </span>
            </div>
            
            <div className="blog-tags-category">
              <span className="blog-category" data-testid="blog-category">
                {blog.category}
              </span>
              
              {blog.tags && blog.tags.length > 0 && (
                <div className="blog-tags" data-testid="blog-tags">
                  {blog.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {isAuthor && (
            <div className="author-actions" data-testid="author-actions">
              <button 
                onClick={handleEdit}
                className="edit-btn"
                data-testid="edit-button"
              >
                Edit Post
              </button>
              <button 
                onClick={handleDelete}
                className="delete-btn"
                data-testid="delete-button"
              >
                Delete Post
              </button>
            </div>
          )}
        </div>
        
        <div className="blog-content" data-testid="blog-content">
          <div className="content-text">
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
        
        <div className="blog-footer">
          <div className="blog-stats">
            <span>Published on {formatDate(blog.publishedAt || blog.createdAt)}</span>
            {blog.updatedAt !== blog.createdAt && (
              <span>Last updated on {formatDate(blog.updatedAt)}</span>
            )}
          </div>
          
          <div className="related-actions">
            <Link to={`/?category=${encodeURIComponent(blog.category)}`} className="category-link">
              More in {blog.category}
            </Link>
            
            {user && !isAuthor && (
              <Link to="/create-blog" className="write-link">
                Write Your Own
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;