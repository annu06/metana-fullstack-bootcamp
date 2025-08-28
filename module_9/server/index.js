const express = require('express');
const cors = require('cors');
const config = require('./config');

// Import routers
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const blogsRouter = require('./routes/blogsRouter');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/blogs', blogsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      blogs: '/api/blogs',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Handle specific error types
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body too large'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Users: http://localhost:${PORT}/api/users`);
  console.log(`   - Blogs: http://localhost:${PORT}/api/blogs`);
  console.log(`\n💡 To get started:`);
  console.log(`   1. Make sure PostgreSQL is running`);
  console.log(`   2. Run: npm run setup-db`);
  console.log(`   3. Run: npm run seed-db`);
  console.log(`   4. Start the frontend: cd ../client && npm start`);
  console.log(`\n🔐 Default accounts after seeding:`);
  console.log(`   Admin: username=admin, password=admin123`);
  console.log(`   User: username=johndoe, password=user123`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;