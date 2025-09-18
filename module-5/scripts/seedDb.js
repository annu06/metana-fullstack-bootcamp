const mongoose = require('mongoose');
const User = require('../models/User');
const Blog = require('../models/Blog');
const connectDB = require('../db/dbconn');
const { MONGODB_URI } = require('../config');

const users = [
  {
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'password123',
    preferences: { defaultMood: 'happy', timezone: 'UTC' },
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: 'password123',
    preferences: { defaultMood: 'focused', timezone: 'UTC+5' },
  },
];

const blogs = [
  {
    title: 'First Blog Post',
    content: 'This is the first blog post.',
  },
  {
    title: 'Second Blog Post',
    content: 'This is the second blog post.',
  },
];

async function seed() {
  await connectDB();
  await User.deleteMany();
  await Blog.deleteMany();
  const createdUsers = await User.insertMany(users);
  blogs[0].user = createdUsers[0]._id;
  blogs[1].user = createdUsers[1]._id;
  await Blog.insertMany(blogs);
  console.log('Database seeded!');
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  mongoose.connection.close();
});
