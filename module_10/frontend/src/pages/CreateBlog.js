import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './CreateBlog.css';

const CreateBlog = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [blogId, setBlogId] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const categories = [
    'Technology',
    'Programming',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'AI/ML',
    'DevOps',
    'Design',
    'Business',
    'Lifestyle',
    'Travel',
    'Food',
    'Health',
    'Education',
    'Other'
  ];

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      setBlogId(id);
      fetchBlog(id);
    }
  }, [id]);

  const fetchBlog = async (blogId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/blogs/${blogId}`);
      const blog = response.data.blog;
      
      // Check if user is the author
      if (blog.author._id !== user._id) {
        navigate('/dashboard');
        return;
      }
      
      setFormData({
        title: blog.title,
        content: blog.content,
        category: blog.category,
        tags: blog.tags ? blog.tags.join(', ') : '',
        status: blog.status
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters long';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // Validate tags format
    if (formData.tags.trim()) {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tags.length > 10) {
        newErrors.tags = 'Maximum 10 tags allowed';
      }
      
      const invalidTags = tags.filter(tag => tag.length > 20);
      if (invalidTags.length > 0) {
        newErrors.tags = 'Each tag must be less than 20 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const blogData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags.trim() 
          ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          : [],
        status: formData.status
      };
      
      let response;
      if (isEditing) {
        response = await axios.put(`/api/blogs/${blogId}`, blogData);
      } else {
        response = await axios.post('/api/blogs', blogData);
      }
      
      const savedBlog = response.data.blog;
      
      // Navigate to the blog detail page or dashboard
      if (savedBlog.status === 'published') {
        navigate(`/blog/${savedBlog._id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ 
          general: error.response?.data?.message || 'Failed to save blog post. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = () => {
    setFormData(prev => ({ ...prev, status: 'draft' }));
    setTimeout(() => {
      document.querySelector('form').dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 0);
  };

  const handlePublish = () => {
    setFormData(prev => ({ ...prev, status: 'published' }));
    setTimeout(() => {
      document.querySelector('form').dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 0);
  };

  if (loading && isEditing) {
    return (
      <div className="create-blog-loading" data-testid="create-blog-loading">
        <div className="loading-spinner"></div>
        <p>Loading blog post...</p>
      </div>
    );
  }

  return (
    <div className="create-blog" data-testid="create-blog">
      <div className="create-blog-container">
        <div className="create-blog-header">
          <h1>{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
          <p>Share your thoughts and ideas with the community</p>
        </div>
        
        <form onSubmit={handleSubmit} className="create-blog-form">
          {errors.general && (
            <div className="error-message" data-testid="general-error">
              {errors.general}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="Enter an engaging title for your blog post"
              disabled={loading}
              data-testid="title-input"
            />
            {errors.title && (
              <span className="field-error" data-testid="title-error">
                {errors.title}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`form-select ${errors.category ? 'error' : ''}`}
              disabled={loading}
              data-testid="category-select"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="field-error" data-testid="category-error">
                {errors.category}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className={`form-input ${errors.tags ? 'error' : ''}`}
              placeholder="Enter tags separated by commas (e.g., react, javascript, tutorial)"
              disabled={loading}
              data-testid="tags-input"
            />
            <small className="form-help">
              Separate multiple tags with commas. Maximum 10 tags, each up to 20 characters.
            </small>
            {errors.tags && (
              <span className="field-error" data-testid="tags-error">
                {errors.tags}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className={`form-textarea ${errors.content ? 'error' : ''}`}
              placeholder="Write your blog content here..."
              rows={15}
              disabled={loading}
              data-testid="content-textarea"
            />
            <small className="form-help">
              Minimum 50 characters required. Write engaging content that provides value to your readers.
            </small>
            {errors.content && (
              <span className="field-error" data-testid="content-error">
                {errors.content}
              </span>
            )}
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="cancel-btn"
              disabled={loading}
              data-testid="cancel-button"
            >
              Cancel
            </button>
            
            <div className="submit-actions">
              <button
                type="button"
                onClick={handleSaveAsDraft}
                className="draft-btn"
                disabled={loading}
                data-testid="save-draft-button"
              >
                {loading && formData.status === 'draft' ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Saving...
                  </>
                ) : (
                  'Save as Draft'
                )}
              </button>
              
              <button
                type="button"
                onClick={handlePublish}
                className="publish-btn"
                disabled={loading}
                data-testid="publish-button"
              >
                {loading && formData.status === 'published' ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Publishing...
                  </>
                ) : (
                  isEditing ? 'Update & Publish' : 'Publish'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;