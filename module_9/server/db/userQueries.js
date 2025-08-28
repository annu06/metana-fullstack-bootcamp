const pool = require('./dbconn');

class UserQueries {
  // Create a new user
  static async createUser(username, email, hashedPassword, role = 'user') {
    const query = `
      INSERT INTO users (username, email, password, role, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, username, email, role, created_at
    `;
    const values = [username, email, hashedPassword, role];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find user by username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get all users (for admin)
  static async getAllUsers() {
    const query = 'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Update user role
  static async updateUserRole(id, role) {
    const query = 'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role';
    const result = await pool.query(query, [role, id]);
    return result.rows[0];
  }

  // Delete user
  static async deleteUser(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Check if username exists
  static async usernameExists(username) {
    const query = 'SELECT COUNT(*) FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return parseInt(result.rows[0].count) > 0;
  }

  // Check if email exists
  static async emailExists(email) {
    const query = 'SELECT COUNT(*) FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = UserQueries;