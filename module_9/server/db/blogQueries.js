const pool = require('./dbconn');

class BlogQueries {
  // Create a new blog post
  static async createBlog(title, content, author_id) {
    const query = `
      INSERT INTO blogs (title, content, author_id, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, title, content, author_id, created_at, updated_at
    `;
    const values = [title, content, author_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all blog posts with author information
  static async getAllBlogs() {
    const query = `
      SELECT b.id, b.title, b.content, b.created_at, b.updated_at,
             u.username as author_name, u.id as author_id
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      ORDER BY b.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get blog by ID
  static async getBlogById(id) {
    const query = `
      SELECT b.id, b.title, b.content, b.created_at, b.updated_at,
             u.username as author_name, u.id as author_id
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE b.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get blogs by author
  static async getBlogsByAuthor(author_id) {
    const query = `
      SELECT b.id, b.title, b.content, b.created_at, b.updated_at,
             u.username as author_name, u.id as author_id
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE b.author_id = $1
      ORDER BY b.created_at DESC
    `;
    const result = await pool.query(query, [author_id]);
    return result.rows;
  }

  // Update blog post
  static async updateBlog(id, title, content) {
    const query = `
      UPDATE blogs 
      SET title = $1, content = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, title, content, author_id, created_at, updated_at
    `;
    const result = await pool.query(query, [title, content, id]);
    return result.rows[0];
  }

  // Delete blog post
  static async deleteBlog(id) {
    const query = 'DELETE FROM blogs WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Check if user owns the blog
  static async isOwner(blogId, userId) {
    const query = 'SELECT COUNT(*) FROM blogs WHERE id = $1 AND author_id = $2';
    const result = await pool.query(query, [blogId, userId]);
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = BlogQueries;