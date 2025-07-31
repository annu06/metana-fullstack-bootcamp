const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./db/dbconn');
const config = require('./config');

// Import routes
const userRouter = require('./routes/userRouter');
const blogsRouter = require('./routes/blogsRouter');

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(morgan('combined')); // Log HTTP requests
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/users', userRouter);
app.use('/api/blogs', blogsRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Module 5 Backend API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      blogs: '/api/blogs'
    },
    documentation: {
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get user by ID',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:id': 'Update user by ID',
        'DELETE /api/users/:id': 'Delete user by ID'
      },
      blogs: {
        'GET /api/blogs': 'Get all blogs (optional ?userId=<id> query parameter)',
        'GET /api/blogs/:id': 'Get blog by ID',
        'POST /api/blogs': 'Create new blog',
        'PUT /api/blogs/:id': 'Update blog by ID',
        'DELETE /api/blogs/:id': 'Delete blog by ID'
      }
    }
  });
});

// 404 handler for specific development requests
app.use('/@vite/client', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'This is a backend API server, not a Vite development server',
    note: 'Use the API endpoints listed in the documentation'
  });
});

// General 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /api/users',
      'POST /api/users',
      'GET /api/users/:id',
      'PUT /api/users/:id',
      'DELETE /api/users/:id',
      'GET /api/blogs',
      'POST /api/blogs',
      'GET /api/blogs/:id',
      'PUT /api/blogs/:id',
      'DELETE /api/blogs/:id'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server function
const startServer = async () => {
  try {
    // Try to connect to MongoDB
    const dbConnection = await connectDB();
    
    if (dbConnection) {
      console.log('✅ Database connected successfully');
    } else {
      console.log('⚠️  Server starting without database connection');
    }

    // Start the server regardless of database connection
    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log('\n🚀 SERVER STARTED SUCCESSFULLY!');
      console.log('═'.repeat(50));
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);
      console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
      console.log(`📝 Blogs API: http://localhost:${PORT}/api/blogs`);
      console.log(`🔧 Environment: ${config.NODE_ENV}`);
      console.log(`📊 Database: ${dbConnection ? 'Connected' : 'Not Connected'}`);
      console.log('═'.repeat(50));
      
      if (!dbConnection) {
        console.log('\n💡 Note: Database not connected. Please set up MongoDB to use all features.');
        console.log('   Check the setup instructions above.');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Start the server
startServer();