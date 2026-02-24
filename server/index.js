const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');

// Import routers
const blogsRouter = require('./routes/blogsRouter');
const userRouter = require('./routes/userRouter');

const app = express();
const PORT = config.port;

// Middleware
// Simple request logger to help debug API requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});
app.use(cors(config.cors));
app.use(express.json());

// API Routes
app.use('/api/blogs', blogsRouter);
app.use('/api/users', userRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Serve static files from React build
if (config.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});