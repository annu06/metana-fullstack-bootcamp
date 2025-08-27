const { query } = require('./dbconn');

// Get all users
async function getAllUsers() {
  try {
    const result = await query('SELECT id, username, email, first_name, last_name, created_at, updated_at FROM users ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
}

// Get user by ID
async function getUserById(id) {
  try {
    const result = await query(
      'SELECT id, username, email, first_name, last_name, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Error fetching user by ID: ${error.message}`);
  }
}

// Get user by email
async function getUserByEmail(email) {
  try {
    const result = await query(
      'SELECT id, username, email, first_name, last_name, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Error fetching user by email: ${error.message}`);
  }
}

// Get user by username
async function getUserByUsername(username) {
  try {
    const result = await query(
      'SELECT id, username, email, first_name, last_name, created_at, updated_at FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Error fetching user by username: ${error.message}`);
  }
}

// Create a new user
async function createUser(userData) {
  const { username, email, password, first_name, last_name } = userData;
  
  try {
    const result = await query(
      `INSERT INTO users (username, email, password, first_name, last_name) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, username, email, first_name, last_name, created_at, updated_at`,
      [username, email, password, first_name, last_name]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint === 'users_email_key') {
        throw new Error('Email already exists');
      } else if (error.constraint === 'users_username_key') {
        throw new Error('Username already exists');
      }
    }
    throw new Error(`Error creating user: ${error.message}`);
  }
}

// Update user
async function updateUser(id, userData) {
  const { username, email, first_name, last_name } = userData;
  
  try {
    const result = await query(
      `UPDATE users 
       SET username = COALESCE($2, username), 
           email = COALESCE($3, email), 
           first_name = COALESCE($4, first_name), 
           last_name = COALESCE($5, last_name)
       WHERE id = $1 
       RETURNING id, username, email, first_name, last_name, created_at, updated_at`,
      [id, username, email, first_name, last_name]
    );
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint === 'users_email_key') {
        throw new Error('Email already exists');
      } else if (error.constraint === 'users_username_key') {
        throw new Error('Username already exists');
      }
    }
    throw new Error(`Error updating user: ${error.message}`);
  }
}

// Delete user
async function deleteUser(id) {
  try {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id, username, email',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
}

// Get user with their blogs
async function getUserWithBlogs(id) {
  try {
    const userResult = await query(
      'SELECT id, username, email, first_name, last_name, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      return null;
    }
    
    const blogsResult = await query(
      'SELECT id, title, content, published, created_at, updated_at FROM blogs WHERE author_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    const user = userResult.rows[0];
    user.blogs = blogsResult.rows;
    
    return user;
  } catch (error) {
    throw new Error(`Error fetching user with blogs: ${error.message}`);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  getUserWithBlogs
};