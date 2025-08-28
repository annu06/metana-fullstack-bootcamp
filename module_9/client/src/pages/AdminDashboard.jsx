import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { usersService } from '../api/users';
import { blogsService } from '../api/blogs';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'users') {
        const response = await usersService.getAllUsers();
        setUsers(response.data.users || []);
      } else {
        const response = await blogsService.getAllBlogs();
        setBlogs(response.data.blogs || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      setActionLoading(userId);
      await usersService.updateUserRole(userId, { role: newRole });
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(userId);
      await usersService.deleteUser(userId);
      
      // Update local state
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(blogId);
      await blogsService.deleteBlog(blogId);
      
      // Update local state
      setBlogs(prev => prev.filter(b => b.id !== blogId));
    } catch (error) {
      console.error('Error deleting blog:', error);
      setError('Failed to delete blog post');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'users', name: 'Users', count: users.length },
    { id: 'blogs', name: 'Blog Posts', count: blogs.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.username}. Manage users and blog posts from here.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                <p className="text-2xl font-semibold text-gray-900">{blogs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Regular Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.role === 'user').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors`}
                >
                  {tab.name}
                  <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading {activeTab}...</p>
              </div>
            ) : (
              <div>
                {activeTab === 'users' ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((userItem) => (
                          <tr key={userItem.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {userItem.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{userItem.username}</div>
                                  <div className="text-sm text-gray-500">{userItem.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                userItem.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {userItem.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(userItem.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {userItem.id !== user.id && (
                                  <>
                                    <select
                                      value={userItem.role}
                                      onChange={(e) => handleRoleUpdate(userItem.id, e.target.value)}
                                      disabled={actionLoading === userItem.id}
                                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    >
                                      <option value="user">User</option>
                                      <option value="admin">Admin</option>
                                    </select>
                                    <button
                                      onClick={() => handleDeleteUser(userItem.id)}
                                      disabled={actionLoading === userItem.id}
                                      className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
                                    >
                                      {actionLoading === userItem.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                  </>
                                )}
                                {userItem.id === user.id && (
                                  <span className="text-gray-400 text-xs">Current User</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Link
                                to={`/blogs/${blog.id}`}
                                className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
                              >
                                {blog.title}
                              </Link>
                              <span className="text-sm text-gray-500">by {blog.author_username}</span>
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {blog.content.substring(0, 200)}...
                            </p>
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                              <span>Created: {formatDate(blog.created_at)}</span>
                              {blog.updated_at !== blog.created_at && (
                                <span>Updated: {formatDate(blog.updated_at)}</span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex space-x-2">
                            <Link
                              to={`/blogs/${blog.id}`}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDeleteBlog(blog.id)}
                              disabled={actionLoading === blog.id}
                              className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === blog.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {blogs.length === 0 && (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No blog posts</h3>
                        <p className="mt-1 text-sm text-gray-500">No blog posts have been created yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;