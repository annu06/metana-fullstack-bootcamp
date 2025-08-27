const express = require('express');
const cors = require('cors');
const config = require('./config');
const { testConnection } = require('./db/dbconn');

// Import routers
const userRouter = require('./routes/userRouter');
const blogsRouter = require('./routes/blogsRouter');

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'Connected' : 'Disconnected',
      environment: config.server.nodeEnv
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// API routes
app.use('/api/users', userRouter);
app.use('/api/blogs', blogsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Module 6 PostgreSQL Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      blogs: '/api/blogs'
    },
    documentation: {
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get user by ID',
        'GET /api/users/:id/blogs': 'Get user with their blogs',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user'
      },
      blogs: {
        'GET /api/blogs': 'Get all blogs (query: ?published=true, ?author=id, ?search=term)',
        'GET /api/blogs/:id': 'Get blog by ID',
        'POST /api/blogs': 'Create new blog',
        'PUT /api/blogs/:id': 'Update blog',
        'PATCH /api/blogs/:id/publish': 'Toggle blog publish status',
        'DELETE /api/blogs/:id': 'Delete blog'
      }
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
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.server.nodeEnv === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log('🚀 Server started successfully!');
      console.log(`📍 Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${config.server.nodeEnv}`);
      console.log('📚 API Documentation available at http://localhost:' + PORT);
      console.log('\n📋 Available endpoints:');
      console.log('  - GET  /health');
      console.log('  - GET  /api/users');
      console.log('  - POST /api/users');
      console.log('  - GET  /api/blogs');
      console.log('  - POST /api/blogs');
      console.log('\n💡 Use npm run db:init to initialize the database');
      console.log('💡 Use npm run db:seed to seed the database with sample data');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  const { closePool } = require('./db/dbconn');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  const { closePool } = require('./db/dbconn');
  await closePool();
  process.exit(0);
});

// Start the server
startServer();