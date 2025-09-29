import React from 'react';
import './modern.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Blogs from './pages/Blogs';
import SingleBlog from './pages/SingleBlog';
import Contact from './pages/Contact';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './pages/ProtectedRoute';
import PrivateRoute from './pages/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <main>
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/protected" element={<ProtectedRoute />} />
              <Route path="/private" element={<PrivateRoute />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
        <footer>
          &copy; {new Date().getFullYear()} Metana Fullstack Bootcamp
        </footer>
      </AuthProvider>
    </Router>
  );
}

export default App;
