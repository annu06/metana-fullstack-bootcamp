const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Import database connection (conditionally for testing)
let connectDB;
try {
  connectDB = require('./db/connection');
} catch (error) {
  console.log('Database connection not available for testing');
  connectDB = { connect: () => Promise.resolve() };
}

// Import middleware
const { performanceMonitor, compressionSetup, securitySetup } = require('./middleware/performance');
const { requestLogger, createRateLimit } = require('./middleware/auth');
const { cache, cacheUserTasks } = require('./middleware/cache');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
if (connectDB && connectDB.connect) {
  connectDB.connect();
} else if (typeof connectDB === 'function') {
  connectDB();
}

// Security middleware
app.use(securitySetup);
app.use(helmet());

// Performance middleware
app.use(performanceMonitor);
app.use(compressionSetup);

// Request logging
app.use(requestLogger);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const generalLimiter = createRateLimit(15 * 60 * 1000, 100, 'Too many requests from this IP');
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set up Handlebars as the view engine
app.engine('handlebars', engine({
    defaultLayout: 'main',
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        formatDate: (date) => new Date(date).toLocaleDateString(),
        capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
        json: (context) => JSON.stringify(context)
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Serve static files with caching
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '1d',
    etag: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    };
    
    res.status(200).json(healthCheck);
});

// API Routes with caching
app.use('/api/auth', authRoutes);
app.use('/api/tasks', cacheUserTasks, taskRoutes);
app.use('/api', apiRoutes);

// Main dashboard route
app.get('/', cache(300), (req, res) => {
    res.render('home', {
        title: 'Mood-Based Todo Dashboard',
        user: req.user || null,
        environment: process.env.NODE_ENV
    });
});

// API documentation route
app.get('/docs', (req, res) => {
    const apiDocs = {
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/auth/register': 'Register new user',
                'POST /api/auth/login': 'User login',
                'GET /api/auth/me': 'Get current user',
                'PUT /api/auth/updatedetails': 'Update user details',
                'PUT /api/auth/updatepassword': 'Update password'
            },
            tasks: {
                'GET /api/tasks': 'Get all tasks',
                'POST /api/tasks': 'Create new task',
                'GET /api/tasks/:id': 'Get specific task',
                'PUT /api/tasks/:id': 'Update task',
                'DELETE /api/tasks/:id': 'Delete task',
                'GET /api/tasks/mood/:mood': 'Get tasks by mood'
            },
            utility: {
                'GET /health': 'Health check',
                'GET /docs': 'API documentation'
            }
        }
    };
    
    res.json(apiDocs);
});

// Handle 404 errors
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏠 Dashboard: http://localhost:${PORT}`);
    console.log(`📖 API Docs: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;