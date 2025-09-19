// Main App component
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthProvider';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ProtectedRoute from './pages/ProtectedRoute';
import PrivateRoute from './pages/PrivateRoute';

function Profile() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h2>Profile</h2>
      <div>Username: {user?.username}</div>
      <div>Role: {user?.role}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function AdminDashboard() {
  return <div>Admin Dashboard (admin only)</div>;
}

function Home() {
  const { isLoggedIn, isAdmin } = useAuth();
  return (
    <div>
      <h1>Metana Fullstack Bootcamp - Module 9</h1>
      <nav>
        <Link to="/">Home</Link> |{' '}
        {!isLoggedIn && <><Link to="/login">Login</Link> | <Link to="/signup">Sign Up</Link> | </>}
        {isLoggedIn && <><Link to="/profile">Profile</Link> | </>}
        {isAdmin && <Link to="/admin">Admin</Link>}
      </nav>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
