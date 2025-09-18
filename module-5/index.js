const express = require('express');
const connectDB = require('./db/dbconn');
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
  res.send('Module 5: MongoDB Integration Starter');
});


// Routers
const userRouter = require('./routes/userRouter');
const blogsRouter = require('./routes/blogsRouter');
app.use('/api/users', userRouter);
app.use('/api/blogs', blogsRouter);

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
