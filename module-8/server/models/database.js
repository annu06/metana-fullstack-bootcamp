const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Create blogs table
  db.run(`CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author TEXT DEFAULT 'Admin',
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create users table (for future authentication)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert sample blog data if table is empty
  db.get("SELECT COUNT(*) as count FROM blogs", (err, row) => {
    if (err) {
      console.error('Error checking blogs table:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('Inserting sample blog data...');
      const sampleBlogs = [
        {
          title: "Welcome to My Portfolio Blog",
          content: "This is the first blog post on my portfolio website. Here I'll be sharing insights about web development, technology trends, and my journey as a developer.",
          excerpt: "Welcome to my portfolio blog where I share development insights and experiences.",
          image_url: "/images/blog1.jpg"
        },
        {
          title: "Building Modern Web Applications with React",
          content: "React has revolutionized how we build user interfaces. In this post, I'll explore the latest features and best practices for building scalable React applications.",
          excerpt: "Exploring React best practices and modern development techniques.",
          image_url: "/images/blog2.jpg"
        },
        {
          title: "The Future of Web Development",
          content: "As we move forward in 2024, web development continues to evolve. Let's discuss the emerging trends and technologies that are shaping the future of web development.",
          excerpt: "Discussing emerging trends and technologies in web development.",
          image_url: "/images/blog3.jpg"
        }
      ];

      const stmt = db.prepare(`INSERT INTO blogs (title, content, excerpt, image_url) VALUES (?, ?, ?, ?)`);
      sampleBlogs.forEach(blog => {
        stmt.run(blog.title, blog.content, blog.excerpt, blog.image_url);
      });
      stmt.finalize();
      console.log('Sample blog data inserted successfully');
    }
  });
});

module.exports = db;