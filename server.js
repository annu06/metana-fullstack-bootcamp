const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/blogs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blogs.html'));
});

app.get('/blog/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'singleBlog.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'adminDashboard.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- http://localhost:3000/ (Homepage)');
  console.log('- http://localhost:3000/blogs (Blog List)');
  console.log('- http://localhost:3000/blog/1 (Single Blog)');
  console.log('- http://localhost:3000/admin (Admin Dashboard)');
});