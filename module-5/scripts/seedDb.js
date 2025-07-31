const mongoose = require('mongoose');
const connectDB = require('../db/dbconn');
const User = require('../models/User');
const Blog = require('../models/Blog');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Blog.deleteMany({});

    // Create sample users
    console.log('Creating sample users...');
    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john.doe@example.com'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com'
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com'
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com'
      },
      {
        name: 'David Brown',
        email: 'david.brown@example.com'
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create sample blogs
    console.log('Creating sample blogs...');
    const blogs = await Blog.insertMany([
      {
        title: 'Getting Started with Node.js',
        content: 'Node.js is a powerful JavaScript runtime built on Chrome\'s V8 JavaScript engine. In this blog post, we\'ll explore the basics of Node.js and how to get started with building server-side applications. We\'ll cover installation, basic concepts, and create a simple HTTP server.',
        user: users[0]._id
      },
      {
        title: 'Understanding MongoDB and Mongoose',
        content: 'MongoDB is a popular NoSQL database that stores data in flexible, JSON-like documents. Mongoose is an elegant MongoDB object modeling library for Node.js. This post will guide you through setting up MongoDB, connecting with Mongoose, and creating your first data models.',
        user: users[0]._id
      },
      {
        title: 'Building RESTful APIs with Express.js',
        content: 'Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. Learn how to create RESTful APIs, handle routing, middleware, and error handling in this comprehensive guide.',
        user: users[1]._id
      },
      {
        title: 'JavaScript ES6+ Features You Should Know',
        content: 'Modern JavaScript has evolved significantly with ES6 and beyond. This post covers essential features like arrow functions, destructuring, template literals, promises, async/await, and modules that every JavaScript developer should master.',
        user: users[1]._id
      },
      {
        title: 'Frontend vs Backend Development',
        content: 'Understanding the difference between frontend and backend development is crucial for aspiring web developers. This article explores the roles, technologies, and skills required for each path, helping you decide which direction suits your interests and career goals.',
        user: users[2]._id
      },
      {
        title: 'Database Design Best Practices',
        content: 'Good database design is fundamental to building scalable and maintainable applications. This post covers normalization, indexing, relationships, and performance optimization techniques that will help you design efficient database schemas.',
        user: users[2]._id
      },
      {
        title: 'Introduction to Web Security',
        content: 'Web security is a critical aspect of modern web development. Learn about common vulnerabilities like XSS, CSRF, SQL injection, and how to protect your applications using security headers, input validation, and authentication best practices.',
        user: users[3]._id
      },
      {
        title: 'Version Control with Git',
        content: 'Git is an essential tool for every developer. This comprehensive guide covers Git basics, branching strategies, collaboration workflows, and advanced features that will help you manage your code effectively in team environments.',
        user: users[3]._id
      },
      {
        title: 'Responsive Web Design Principles',
        content: 'Creating websites that work seamlessly across all devices is essential in today\'s mobile-first world. Learn about flexible grids, media queries, mobile-first design, and modern CSS techniques for building responsive web applications.',
        user: users[4]._id
      },
      {
        title: 'Testing Your Node.js Applications',
        content: 'Testing is crucial for maintaining code quality and preventing bugs in production. This post covers different types of testing, popular testing frameworks like Jest and Mocha, and best practices for writing effective tests for your Node.js applications.',
        user: users[4]._id
      }
    ]);

    console.log(`Created ${blogs.length} blogs`);

    console.log('Database seeded successfully!');
    console.log('\nSample Data Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Blogs: ${blogs.length}`);
    
    // Display some sample data
    console.log('\nSample Users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    });

    console.log('\nSample Blogs:');
    blogs.forEach((blog, index) => {
      const author = users.find(user => user._id.equals(blog.user));
      console.log(`${index + 1}. "${blog.title}" by ${author.name}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
};

// Run the seed function
seedData();