const { pool } = require('./dbconn');
const bcrypt = require('bcryptjs');

// Create a new user
async function createUser(data) {
    const client = await pool.connect();
    
    try {
        const { name, email, password } = data;
        
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const query = `
            INSERT INTO users (name, email, password) 
            VALUES ($1, $2, $3) 
            RETURNING id, name, email, created_at, updated_at
        `;
        
        const result = await client.query(query, [name, email, hashedPassword]);
        return result.rows[0];
        
    } finally {
        client.release();
    }
}

// Get all users
async function getAllUsers() {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT id, name, email, created_at, updated_at, last_login 
            FROM users 
            ORDER BY created_at DESC
        `;
        
        const result = await client.query(query);
        return result.rows;
        
    } finally {
        client.release();
    }
}

// Get user by ID
async function getUserById(id) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT id, name, email, created_at, updated_at, last_login 
            FROM users 
            WHERE id = $1
        `;
        
        const result = await client.query(query, [id]);
        return result.rows[0] || null;
        
    } finally {
        client.release();
    }
}

// Get user by email (for authentication)
async function getUserByEmail(email) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT id, name, email, password, created_at, updated_at, last_login 
            FROM users 
            WHERE email = $1
        `;
        
        const result = await client.query(query, [email]);
        return result.rows[0] || null;
        
    } finally {
        client.release();
    }
}

// Update user by ID
async function updateUser(id, data) {
    const client = await pool.connect();
    
    try {
        const { name, email } = data;
        
        const query = `
            UPDATE users 
            SET name = COALESCE($1, name), 
                email = COALESCE($2, email),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 
            RETURNING id, name, email, created_at, updated_at, last_login
        `;
        
        const result = await client.query(query, [name, email, id]);
        return result.rows[0] || null;
        
    } finally {
        client.release();
    }
}

// Update user password
async function updateUserPassword(id, newPassword) {
    const client = await pool.connect();
    
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        const query = `
            UPDATE users 
            SET password = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 
            RETURNING id, name, email, created_at, updated_at
        `;
        
        const result = await client.query(query, [hashedPassword, id]);
        return result.rows[0] || null;
        
    } finally {
        client.release();
    }
}

// Update last login
async function updateLastLogin(id) {
    const client = await pool.connect();
    
    try {
        const query = `
            UPDATE users 
            SET last_login = CURRENT_TIMESTAMP
            WHERE id = $1 
            RETURNING id, name, email, created_at, updated_at, last_login
        `;
        
        const result = await client.query(query, [id]);
        return result.rows[0] || null;
        
    } finally {
        client.release();
    }
}

// Delete user by ID
async function deleteUser(id) {
    const client = await pool.connect();
    
    try {
        const query = `
            DELETE FROM users 
            WHERE id = $1 
            RETURNING id, name, email
        `;
        
        const result = await client.query(query, [id]);
        return result.rows[0] || null;
        
    } finally {
        client.release();
    }
}

// Get user with their blogs count
async function getUserWithBlogsCount(id) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.created_at, 
                u.updated_at, 
                u.last_login,
                COUNT(b.id) as blog_count
            FROM users u
            LEFT JOIN blogs b ON u.id = b.author_id
            WHERE u.id = $1
            GROUP BY u.id, u.name, u.email, u.created_at, u.updated_at, u.last_login
        `;
        
        const result = await client.query(query, [id]);
        return result.rows[0] || null;
        
    } finally {
        client.release();
    }
}

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    updateUserPassword,
    updateLastLogin,
    deleteUser,
    getUserWithBlogsCount,
};
