const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'module6_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

const users = [
  {
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'password123',
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: 'password123',
  },
  {
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    password: 'password123',
  },
];

const blogs = [
  {
    title: 'Introduction to PostgreSQL',
    content: 'PostgreSQL is a powerful, open-source object-relational database system with over 30 years of active development.',
  },
  {
    title: 'Building REST APIs with Node.js',
    content: 'In this post, we explore how to build robust REST APIs using Node.js and Express.js framework.',
  },
  {
    title: 'Database Design Best Practices',
    content: 'Learn about normalization, indexing, and foreign key relationships for optimal database performance.',
  },
  {
    title: 'Modern Web Development',
    content: 'Exploring the latest trends in web development including React, Node.js, and microservices architecture.',
  },
];

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Clear existing data
    await client.query('DELETE FROM blogs');
    await client.query('DELETE FROM users');
    
    // Reset sequences
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE blogs_id_seq RESTART WITH 1');
    
    console.log('🗑️  Cleared existing data');
    
    // Insert users with hashed passwords
    const createdUsers = [];
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      const result = await client.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [user.name, user.email, hashedPassword]
      );
      createdUsers.push(result.rows[0]);
    }
    
    console.log(`👥 Created ${createdUsers.length} users`);
    
    // Insert blogs and assign them to users
    let blogCount = 0;
    for (const blog of blogs) {
      const authorId = createdUsers[blogCount % createdUsers.length].id;
      await client.query(
        'INSERT INTO blogs (title, content, author_id) VALUES ($1, $2, $3)',
        [blog.title, blog.content, authorId]
      );
      blogCount++;
    }
    
    console.log(`📝 Created ${blogs.length} blogs`);
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Display summary
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const blogCount2 = await client.query('SELECT COUNT(*) FROM blogs');
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Total users: ${userCount.rows[0].count}`);
    console.log(`📊 Total blogs: ${blogCount2.rows[0].count}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = seed;
