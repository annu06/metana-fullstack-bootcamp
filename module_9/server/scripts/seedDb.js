const bcrypt = require('bcrypt');
const pool = require('../db/dbconn');
const UserQueries = require('../db/userQueries');
const BlogQueries = require('../db/blogQueries');

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await UserQueries.createUser(
      'admin',
      'admin@example.com',
      adminPassword,
      'admin'
    );
    console.log('Admin user created:', adminUser.username);
    
    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const regularUser = await UserQueries.createUser(
      'johndoe',
      'john@example.com',
      userPassword,
      'user'
    );
    console.log('Regular user created:', regularUser.username);
    
    // Create another regular user
    const user2Password = await bcrypt.hash('jane123', 12);
    const regularUser2 = await UserQueries.createUser(
      'janedoe',
      'jane@example.com',
      user2Password,
      'user'
    );
    console.log('Regular user created:', regularUser2.username);
    
    // Create sample blog posts
    const blog1 = await BlogQueries.createBlog(
      'Welcome to Our Blog Platform',
      'This is the first blog post on our platform. We are excited to share knowledge and insights with our community. This platform allows users to create, read, update, and delete blog posts with proper authentication and authorization.',
      adminUser.id
    );
    console.log('Blog post created:', blog1.title);
    
    const blog2 = await BlogQueries.createBlog(
      'Getting Started with React and Node.js',
      'In this comprehensive guide, we will explore how to build a full-stack application using React for the frontend and Node.js for the backend. We will cover authentication, database integration, and best practices for modern web development.',
      regularUser.id
    );
    console.log('Blog post created:', blog2.title);
    
    const blog3 = await BlogQueries.createBlog(
      'Understanding JWT Authentication',
      'JSON Web Tokens (JWT) are a popular method for handling authentication in modern web applications. In this post, we will dive deep into how JWT works, its benefits, and how to implement it securely in your applications.',
      regularUser2.id
    );
    console.log('Blog post created:', blog3.title);
    
    const blog4 = await BlogQueries.createBlog(
      'Database Design Best Practices',
      'Designing a good database schema is crucial for the performance and scalability of your application. This post covers normalization, indexing, relationships, and other important concepts for effective database design.',
      adminUser.id
    );
    console.log('Blog post created:', blog4.title);
    
    const blog5 = await BlogQueries.createBlog(
      'Frontend Security Considerations',
      'Security should be a top priority when developing frontend applications. This post discusses common security vulnerabilities, how to prevent them, and best practices for keeping your users and data safe.',
      regularUser.id
    );
    console.log('Blog post created:', blog5.title);
    
    console.log('\nDatabase seeded successfully!');
    console.log('\nDefault accounts created:');
    console.log('Admin - Username: admin, Password: admin123');
    console.log('User 1 - Username: johndoe, Password: user123');
    console.log('User 2 - Username: janedoe, Password: jane123');
    console.log('\nSample blog posts have been created by these users.');
    
  } catch (error) {
    console.error('Error seeding database:', error);
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