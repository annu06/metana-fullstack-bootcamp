const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const blogRoutes = require('./routes/blogs');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);

// Root route for API
app.get('/', (req, res) => {
  res.json({ 
    message: 'Module 8 Portfolio API Server', 
    version: '1.0.0',
    endpoints: {
      blogs: '/api/blogs',
      users: '/api/users',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Serve static files from React build (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});