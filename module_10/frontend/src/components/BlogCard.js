import React from 'react';
import { Link } from 'react-router-dom';
import './BlogCard.css';

const BlogCard = ({ blog, showActions = false, onEdit, onDelete }) => {
  const {
    _id,
    title,
    excerpt,
    author,
    category,
    tags,
    status,
    createdAt,
    publishedAt
  } = blog;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(_id);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this blog post?')) {
      onDelete(_id);
    }
  };

  return (
    <div className={`blog-card ${status === 'draft' ? 'draft' : ''}`} data-testid="blog-card">
      <Link to={`/blog/${_id}`} className="blog-card-link">
        <div className="blog-card-header">
          <h3 className="blog-card-title" data-testid="blog-title">{title}</h3>
          {status === 'draft' && (
            <span className="draft-badge" data-testid="draft-badge">Draft</span>
          )}
        </div>
        
        <div className="blog-card-content">
          <p className="blog-card-excerpt" data-testid="blog-excerpt">{excerpt}</p>
        </div>
        
        <div className="blog-card-meta">
          <div className="blog-card-author" data-testid="blog-author">
            By {author?.username || 'Unknown Author'}
          </div>
          <div className="blog-card-date" data-testid="blog-date">
            {formatDate(publishedAt || createdAt)}
          </div>
        </div>
        
        <div className="blog-card-footer">
          <div className="blog-card-category" data-testid="blog-category">
            {category}
          </div>
          {tags && tags.length > 0 && (
            <div className="blog-card-tags" data-testid="blog-tags">
              {tags.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      
      {showActions && (
        <div className="blog-card-actions" data-testid="blog-actions">
          <button 
            onClick={handleEdit}
            className="action-btn edit-btn"
            data-testid="edit-button"
          >
            Edit
          </button>
          <button 
            onClick={handleDelete}
            className="action-btn delete-btn"
            data-testid="delete-button"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogCard;