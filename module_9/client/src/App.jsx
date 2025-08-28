import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Navigation from './components/Navigation';
import ProtectedRoute from './pages/ProtectedRoute';
import PrivateRoute from './pages/PrivateRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import './index.css';

// Placeholder components for routes that haven't been created yet
const Home = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Our Blog Platform</h1>
        <p className="text-xl text-gray-600 mb-8">
          Share your thoughts, connect with others, and explore amazing content.
        </p>
        <div className="space-x-4">
          <a
            href="/blogs"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Explore Blogs
          </a>
          <a
            href="/create-account"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Join Us
          </a>
        </div>
      </div>
    </div>
  </div>
);

const Blogs = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog Posts</h1>
      <p className="text-gray-600">Blog functionality will be implemented here.</p>
    </div>
  </div>
);

const About = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">About Us</h1>
      <p className="text-gray-600">Learn more about our platform and mission.</p>
    </div>
  </div>
);

const Contact = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
      <p className="text-gray-600">Get in touch with us.</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<SignUp />} />
            
            {/* Protected Routes (require authentication) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            {/* Private Routes (admin only) */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;