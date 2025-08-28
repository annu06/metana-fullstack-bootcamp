import React, { useState, useEffect } from 'react';
import BlogCard from '../components/BlogCard';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const blogsPerPage = 6;

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchTerm, selectedCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: blogsPerPage
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      const response = await axios.get('/api/blogs', { params });
      const { blogs: fetchedBlogs, totalPages: pages, totalBlogs: total } = response.data;
      
      setBlogs(fetchedBlogs);
      setTotalPages(pages);
      setTotalBlogs(total);
      
      // Extract unique categories from all blogs for filter
      const uniqueCategories = [...new Set(fetchedBlogs.map(blog => blog.category))];
      setCategories(prev => {
        const combined = [...new Set([...prev, ...uniqueCategories])];
        return combined.sort();
      });
      
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to load blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="pagination-btn"
          data-testid="prev-page"
        >
          Previous
        </button>
      );
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          data-testid={`page-${i}`}
        >
          {i}
        </button>
      );
    }
    
    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="pagination-btn"
          data-testid="next-page"
        >
          Next
        </button>
      );
    }
    
    return (
      <div className="pagination" data-testid="pagination">
        {pages}
      </div>
    );
  };

  if (loading && currentPage === 1) {
    return (
      <div className="home-loading" data-testid="home-loading">
        <div className="loading-spinner"></div>
        <p aria-live="polite">Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className="home" data-testid="home">
      <div className="home-header">
        <h1>Welcome to BlogApp</h1>
        <p>Discover amazing stories and insights from our community of writers.</p>
      </div>

      {error && (
        <div className="error-message" data-testid="error-message">
          {error}
          <button onClick={fetchBlogs} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="home-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
            data-testid="search-input"
            aria-label="Search blogs"
          />
        </div>
        
        <div className="filter-container">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="category-filter"
            data-testid="category-filter"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="home-content">
        {loading ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="no-blogs" data-testid="no-blogs">
            {searchTerm || selectedCategory ? (
              <>
                <h3>No blogs found</h3>
                <p>Try adjusting your search terms or filters.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setCurrentPage(1);
                  }}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <h3>No blogs available</h3>
                <p>Be the first to share your story!</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="blogs-info">
              <p data-testid="blogs-count">
                Showing {blogs.length} of {totalBlogs} blog{totalBlogs !== 1 ? 's' : ''}
                {(searchTerm || selectedCategory) && ' (filtered)'}
              </p>
            </div>
            
            <div className="blogs-grid" data-testid="blogs-grid">
              {blogs.map(blog => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
            
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;