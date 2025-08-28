import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    
    // Clear success message when user makes changes
    if (success) {
      setSuccess(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Username must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
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
    setSuccess(false);
    
    try {
      await updateProfile({
        username: formData.username.trim(),
        email: formData.email.trim(),
        bio: formData.bio.trim()
      });
      
      setSuccess(true);
      setErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ 
          general: error.response?.data?.message || 'Failed to update profile. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const hasChanges = () => {
    return (
      formData.username !== (user?.username || '') ||
      formData.email !== (user?.email || '') ||
      formData.bio !== (user?.bio || '')
    );
  };

  if (!user) {
    return (
      <div className="profile-loading" data-testid="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile" data-testid="profile">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="profile-info">
            <h1>{user.username}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-meta">
              <span className="join-date">
                Member since {formatDate(user.createdAt)}
              </span>
              <span className="role-badge" data-testid="role-badge">
                {user.role}
              </span>
              <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`} data-testid="status-badge">
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="profile-content">
          <div className="profile-form-section">
            <h2>Edit Profile</h2>
            
            {success && (
              <div className="success-message" data-testid="success-message">
                Profile updated successfully!
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="profile-form">
              {errors.general && (
                <div className="error-message" data-testid="general-error">
                  {errors.general}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  placeholder="Enter your username"
                  disabled={loading}
                  data-testid="username-input"
                />
                {errors.username && (
                  <span className="field-error" data-testid="username-error">
                    {errors.username}
                  </span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email address"
                  disabled={loading}
                  data-testid="email-input"
                />
                {errors.email && (
                  <span className="field-error" data-testid="email-error">
                    {errors.email}
                  </span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className={`form-textarea ${errors.bio ? 'error' : ''}`}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  disabled={loading}
                  data-testid="bio-textarea"
                />
                <small className="form-help">
                  {formData.bio.length}/500 characters
                </small>
                {errors.bio && (
                  <span className="field-error" data-testid="bio-error">
                    {errors.bio}
                  </span>
                )}
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      username: user?.username || '',
                      email: user?.email || '',
                      bio: user?.bio || ''
                    });
                    setErrors({});
                    setSuccess(false);
                  }}
                  className="reset-btn"
                  disabled={loading || !hasChanges()}
                  data-testid="reset-button"
                >
                  Reset
                </button>
                
                <button
                  type="submit"
                  className="save-btn"
                  disabled={loading || !hasChanges()}
                  data-testid="save-button"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="profile-stats-section">
            <h2>Account Information</h2>
            
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Account Status</div>
                <div className={`stat-value ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Role</div>
                <div className="stat-value">{user.role}</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Member Since</div>
                <div className="stat-value">{formatDate(user.createdAt)}</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Last Updated</div>
                <div className="stat-value">{formatDate(user.updatedAt)}</div>
              </div>
            </div>
            
            <div className="account-actions">
              <h3>Account Actions</h3>
              <div className="action-buttons">
                <button className="action-btn secondary" disabled>
                  Change Password
                </button>
                <button className="action-btn secondary" disabled>
                  Download Data
                </button>
                <button className="action-btn danger" disabled>
                  Delete Account
                </button>
              </div>
              <p className="action-note">
                These features are coming soon. Contact support if you need assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;