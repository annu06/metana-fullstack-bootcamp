import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import Projects from './pages/Projects';
import About from './pages/About';
import Contact from './pages/Contact';
import SingleBlog from './pages/SingleBlog';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Home />} />
          
          {/* Blogs */}
          <Route path="/blogs" element={<Blogs />} />
          
          {/* Single Blog Page */}
          <Route path="/blogs/:id" element={<SingleBlog />} />
          
          {/* Projects */}
          <Route path="/projects" element={<Projects />} />
          
          {/* About */}
          <Route path="/about" element={<About />} />
          
          {/* Contact */}
          <Route path="/contact" element={<Contact />} />
          
          {/* Admin Dashboard */}
          <Route path="/admin-dash" element={<AdminDashboard />} />
          
          {/* 404 Not Found - catch all other routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
