const express = require('express');
const { connectDB } = require('./db/dbconn');
const { PORT } = require('./config');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Module 6: PostgreSQL Integration API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      blogs: '/api/blogs'
    }
  });
});

// API Documentation route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    endpoints: {
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get user by ID',
        'GET /api/users/:id/stats': 'Get user with blog count',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:id': 'Update user',
        'PATCH /api/users/:id/password': 'Update user password',
        'DELETE /api/users/:id': 'Delete user'
      },
      blogs: {
        'GET /api/blogs': 'Get all blogs',
        'GET /api/blogs/:id': 'Get blog by ID',
        'GET /api/blogs/stats': 'Get blog statistics',
        'GET /api/blogs/search?q=term': 'Search blogs',
        'GET /api/blogs/author/:authorId': 'Get blogs by author',
        'POST /api/blogs': 'Create new blog',
        'PUT /api/blogs/:id': 'Update blog',
        'DELETE /api/blogs/:id': 'Delete blog'
      }
    }
  });
});

// Routers
const userRouter = require('./routes/userRouter');
const blogsRouter = require('./routes/blogsRouter');
app.use('/api/users', userRouter);
app.use('/api/blogs', blogsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Connect to PostgreSQL and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
    console.log(`💾 Database: PostgreSQL`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
