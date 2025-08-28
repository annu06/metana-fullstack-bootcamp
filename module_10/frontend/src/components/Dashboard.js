import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BlogCard from './BlogCard';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserBlogs();
  }, [user]);

  const fetchUserBlogs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/blogs/user/${user._id}`);
      const userBlogs = response.data.blogs;
      
      setBlogs(userBlogs);
      
      // Calculate stats
      const published = userBlogs.filter(blog => blog.status === 'published').length;
      const draft = userBlogs.filter(blog => blog.status === 'draft').length;
      
      setStats({
        total: userBlogs.length,
        published,
        draft
      });
    } catch (error) {
      console.error('Error fetching user blogs:', error);
      setError('Failed to load your blogs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blogId) => {
    navigate(`/edit-blog/${blogId}`);
  };

  const handleDelete = async (blogId) => {
    try {
      await axios.delete(`/api/blogs/${blogId}`);
      
      // Remove the deleted blog from state
      setBlogs(prev => prev.filter(blog => blog._id !== blogId));
      
      // Update stats
      const deletedBlog = blogs.find(blog => blog._id === blogId);
      if (deletedBlog) {
        setStats(prev => ({
          total: prev.total - 1,
          published: deletedBlog.status === 'published' ? prev.published - 1 : prev.published,
          draft: deletedBlog.status === 'draft' ? prev.draft - 1 : prev.draft
        }));
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      setError('Failed to delete blog. Please try again.');
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    // Filter by status
    if (filter === 'published' && blog.status !== 'published') return false;
    if (filter === 'draft' && blog.status !== 'draft') return false;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        blog.title.toLowerCase().includes(searchLower) ||
        blog.excerpt.toLowerCase().includes(searchLower) ||
        blog.category.toLowerCase().includes(searchLower) ||
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="dashboard-loading" data-testid="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard" data-testid="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Welcome back, {user?.username}!</h1>
          <p>Manage your blog posts and track your writing progress.</p>
        </div>
        
        <Link to="/create-blog" className="create-blog-btn" data-testid="create-blog-button">
          + Create New Blog
        </Link>
      </div>

      {error && (
        <div className="error-message" data-testid="error-message">
          {error}
          <button onClick={fetchUserBlogs} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="dashboard-stats" data-testid="dashboard-stats">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Posts</p>
        </div>
        <div className="stat-card">
          <h3>{stats.published}</h3>
          <p>Published</p>
        </div>
        <div className="stat-card">
          <h3>{stats.draft}</h3>
          <p>Drafts</p>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search your blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            data-testid="search-input"
          />
        </div>
        
        <div className="filter-container">
          <label htmlFor="filter">Filter by status:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
            data-testid="filter-select"
          >
            <option value="all">All Posts</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      <div className="dashboard-content">
        {filteredBlogs.length === 0 ? (
          <div className="no-blogs" data-testid="no-blogs">
            {blogs.length === 0 ? (
              <>
                <h3>No blog posts yet</h3>
                <p>Start your writing journey by creating your first blog post!</p>
                <Link to="/create-blog" className="create-first-blog-btn">
                  Create Your First Blog
                </Link>
              </>
            ) : (
              <>
                <h3>No blogs match your search</h3>
                <p>Try adjusting your search terms or filters.</p>
              </>
            )}
          </div>
        ) : (
          <div className="blogs-grid" data-testid="blogs-grid">
            {filteredBlogs.map(blog => (
              <BlogCard
                key={blog._id}
                blog={blog}
                showActions={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;