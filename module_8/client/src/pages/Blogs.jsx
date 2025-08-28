import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBlogs } from '../api/blogs';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'technology', name: 'Technology' },
    { id: 'web-development', name: 'Web Development' },
    { id: 'programming', name: 'Programming' },
    { id: 'tutorials', name: 'Tutorials' },
    { id: 'career', name: 'Career' },
    { id: 'personal', name: 'Personal' }
  ];

  // Mock data for demonstration (replace with actual API call)
  const mockBlogs = [
    {
      id: 1,
      title: 'Getting Started with React Hooks',
      excerpt: 'Learn how to use React Hooks to manage state and side effects in functional components. This comprehensive guide covers useState, useEffect, and custom hooks.',
      content: 'Full blog content here...',
      author: 'John Doe',
      category: 'web-development',
      tags: ['React', 'JavaScript', 'Hooks'],
      publishedAt: '2024-01-15',
      readTime: 8,
      image: 'from-blue-400 to-blue-600',
      featured: true
    },
    {
      id: 2,
      title: 'Building RESTful APIs with Node.js and Express',
      excerpt: 'A step-by-step guide to creating robust RESTful APIs using Node.js and Express framework. Includes authentication, validation, and best practices.',
      content: 'Full blog content here...',
      author: 'Jane Smith',
      category: 'programming',
      tags: ['Node.js', 'Express', 'API'],
      publishedAt: '2024-01-10',
      readTime: 12,
      image: 'from-green-400 to-green-600',
      featured: false
    },
    {
      id: 3,
      title: 'CSS Grid vs Flexbox: When to Use Which',
      excerpt: 'Understanding the differences between CSS Grid and Flexbox, and knowing when to use each layout method for optimal web design.',
      content: 'Full blog content here...',
      author: 'Mike Johnson',
      category: 'web-development',
      tags: ['CSS', 'Grid', 'Flexbox'],
      publishedAt: '2024-01-08',
      readTime: 6,
      image: 'from-purple-400 to-purple-600',
      featured: true
    },
    {
      id: 4,
      title: 'My Journey into Full-Stack Development',
      excerpt: 'A personal story about transitioning from a different career into full-stack development, including challenges faced and lessons learned.',
      content: 'Full blog content here...',
      author: 'Sarah Wilson',
      category: 'career',
      tags: ['Career', 'Personal Growth', 'Full-Stack'],
      publishedAt: '2024-01-05',
      readTime: 10,
      image: 'from-pink-400 to-pink-600',
      featured: false
    },
    {
      id: 5,
      title: 'Advanced JavaScript Concepts Every Developer Should Know',
      excerpt: 'Dive deep into advanced JavaScript concepts including closures, prototypes, async/await, and more to level up your programming skills.',
      content: 'Full blog content here...',
      author: 'Alex Brown',
      category: 'programming',
      tags: ['JavaScript', 'Advanced', 'Concepts'],
      publishedAt: '2024-01-03',
      readTime: 15,
      image: 'from-yellow-400 to-yellow-600',
      featured: true
    },
    {
      id: 6,
      title: 'Setting Up a Modern Development Environment',
      excerpt: 'Complete guide to setting up a productive development environment with VS Code, extensions, terminal setup, and workflow optimization.',
      content: 'Full blog content here...',
      author: 'Chris Davis',
      category: 'tutorials',
      tags: ['Development', 'Tools', 'Setup'],
      publishedAt: '2024-01-01',
      readTime: 7,
      image: 'from-indigo-400 to-indigo-600',
      featured: false
    }
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        // Try to fetch from API, fallback to mock data
        try {
          const response = await getAllBlogs();
          setBlogs(response.data || response);
        } catch (apiError) {
          console.log('API not available, using mock data');
          setBlogs(mockBlogs);
        }
      } catch (err) {
        setError('Failed to load blogs');
        setBlogs(mockBlogs); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = blogs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(blog => blog.category === selectedCategory);
    }

    // Sort blogs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt) - new Date(a.publishedAt);
        case 'oldest':
          return new Date(a.publishedAt) - new Date(b.publishedAt);
        case 'readTime':
          return a.readTime - b.readTime;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, selectedCategory, sortBy]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const featuredBlogs = blogs.filter(blog => blog.featured);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Blog
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Insights, tutorials, and thoughts on web development, programming, and technology
            </p>
          </div>
        </div>
      </section>

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Posts
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Don't miss these highlighted articles
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredBlogs.slice(0, 2).map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.id}`}
                  className="group bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`h-64 bg-gradient-to-r ${blog.image} flex items-center justify-center`}>
                    <div className="text-white text-center">
                      <svg className="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      <p className="text-lg font-semibold">Featured Article</p>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center mb-4">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                        {categories.find(cat => cat.id === blog.category)?.name || blog.category}
                      </span>
                      <span className="ml-4 text-gray-500 text-sm">
                        {blog.readTime} min read
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {blog.author.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{blog.author}</p>
                          <p className="text-sm text-gray-500">{formatDate(blog.publishedAt)}</p>
                        </div>
                      </div>
                      <span className="text-primary-600 font-semibold group-hover:text-primary-700">
                        Read More →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Articles
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by title, content, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="readTime">Reading Time</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Blogs */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              All Articles
            </h2>
            <p className="text-lg text-gray-600">
              {filteredBlogs.length} article{filteredBlogs.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.id}`}
                  className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`h-48 bg-gradient-to-r ${blog.image} flex items-center justify-center`}>
                    <div className="text-white text-center">
                      <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      <p className="font-semibold">Article</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        {categories.find(cat => cat.id === blog.category)?.name || blog.category}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {blog.readTime} min read
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {blog.excerpt.length > 100 
                        ? `${blog.excerpt.substring(0, 100)}...` 
                        : blog.excerpt
                      }
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-xs font-semibold">
                            {blog.author.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs font-medium text-gray-900">{blog.author}</p>
                          <p className="text-xs text-gray-500">{formatDate(blog.publishedAt)}</p>
                        </div>
                      </div>
                      <span className="text-primary-600 text-sm font-semibold group-hover:text-primary-700">
                        Read →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="h-24 w-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default Blogs;