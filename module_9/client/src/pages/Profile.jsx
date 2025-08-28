import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { blogsService } from '../api/blogs';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username,
        email: user.email
      });
      fetchUserBlogs();
    }
  }, [user]);

  const fetchUserBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogsService.getBlogsByUserId(user.id);
      setUserBlogs(response.data.blogs || []);
    } catch (error) {
      console.error('Error fetching user blogs:', error);
      setError('Failed to load your blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm({
        username: user.username,
        email: user.email
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError('');

    try {
      // In a real application, you would call an API to update the user profile
      // For now, we'll just update the local state
      await updateUser(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <form onSubmit={handleUpdateProfile} className="mt-6 border-t pt-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={editForm.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updateLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                <p className="text-2xl font-semibold text-gray-900">{userBlogs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {user.created_at ? formatDate(user.created_at) : 'Recently'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-2xl font-semibold text-gray-900 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Blogs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Blog Posts</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading your blogs...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : userBlogs.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No blog posts</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first blog post.</p>
              <div className="mt-6">
                <Link
                  to="/blogs"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  View All Blogs
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {userBlogs.map((blog) => (
                <div key={blog.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/blogs/${blog.id}`}
                        className="block hover:text-primary-600 transition-colors"
                      >
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{blog.title}</h3>
                        <p className="text-gray-600 line-clamp-2">{blog.content.substring(0, 150)}...</p>
                      </Link>
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <span>Created: {formatDate(blog.created_at)}</span>
                        {blog.updated_at !== blog.created_at && (
                          <span className="ml-4">Updated: {formatDate(blog.updated_at)}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link
                        to={`/blogs/${blog.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;