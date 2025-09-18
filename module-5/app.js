// Basic Express + MongoDB (Mongoose) starter app for module-5
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/module5db';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic route
taskSchema = new mongoose.Schema({
  title: String,
  completed: Boolean
});
const Task = mongoose.model('Task', taskSchema);

app.get('/', (req, res) => {
  res.send('Module 5: MongoDB Integration Starter');
});

// Example API endpoint
app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
