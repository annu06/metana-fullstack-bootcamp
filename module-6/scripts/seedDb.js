const { Pool } = require('pg');
const config = require('../config');

async function seedDatabase() {
  const pool = new Pool(config.database);
  
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // Sample users data
    const users = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'hashed_password_1',
        first_name: 'John',
        last_name: 'Doe'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'hashed_password_2',
        first_name: 'Jane',
        last_name: 'Smith'
      },
      {
        username: 'bob_wilson',
        email: 'bob@example.com',
        password: 'hashed_password_3',
        first_name: 'Bob',
        last_name: 'Wilson'
      }
    ];
    
    console.log('Seeding users...');
    
    // Insert users
    for (const user of users) {
      await pool.query(
        `INSERT INTO users (username, email, password, first_name, last_name) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (email) DO NOTHING`,
        [user.username, user.email, user.password, user.first_name, user.last_name]
      );
    }
    
    // Sample blogs data
    const blogs = [
      {
        title: 'Getting Started with PostgreSQL',
        content: 'PostgreSQL is a powerful, open source object-relational database system. In this blog post, we will explore the basics of PostgreSQL and how to get started with it.',
        author_id: 1,
        published: true
      },
      {
        title: 'Node.js and Express Best Practices',
        content: 'Building robust web applications with Node.js and Express requires following certain best practices. Here are some key recommendations for structuring your application.',
        author_id: 1,
        published: true
      },
      {
        title: 'Understanding Database Relationships',
        content: 'Database relationships are fundamental to relational database design. This post covers one-to-many, many-to-many, and one-to-one relationships.',
        author_id: 2,
        published: false
      },
      {
        title: 'RESTful API Design Principles',
        content: 'REST (Representational State Transfer) is an architectural style for designing networked applications. Learn the key principles of RESTful API design.',
        author_id: 2,
        published: true
      },
      {
        title: 'JavaScript ES6+ Features',
        content: 'Modern JavaScript includes many powerful features that can make your code more concise and readable. Explore arrow functions, destructuring, and more.',
        author_id: 3,
        published: true
      }
    ];
    
    console.log('Seeding blogs...');
    
    // Insert blogs
    for (const blog of blogs) {
      await pool.query(
        `INSERT INTO blogs (title, content, author_id, published) 
         VALUES ($1, $2, $3, $4)`,
        [blog.title, blog.content, blog.author_id, blog.published]
      );
    }
    
    console.log('✅ Database seeded successfully!');
    console.log(`Inserted ${users.length} users and ${blogs.length} blogs.`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;