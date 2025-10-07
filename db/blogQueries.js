const { pool } = require('./dbconn');

// Create a new blog
async function createBlog(data) {
    const client = await pool.connect();
    
    try {
        const { title, content, author_id } = data;
        
        const query = `
            INSERT INTO blogs (title, content, author_id) 
            VALUES ($1, $2, $3) 
            RETURNING id, title, content, author_id, created_at, updated_at
        `;
        
        const result = await client.query(query, [title, content, author_id]);
        return result.rows[0];
        
    } finally {
        client.release();
    }
}

// Get all blogs with author information
async function getAllBlogs() {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT 
                b.id, 
                b.title, 
                b.content, 
                b.author_id,
                b.created_at, 
                b.updated_at,
                u.name as author_name,
                u.email as author_email
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            ORDER BY b.created_at DESC
        `;
        
        const result = await client.query(query);
        return result.rows;
        
    } finally {
        client.release();
    }
}

// Get blog by ID with author information
async function getBlogById(id) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT 
                b.id, 
                b.title, 
                b.content, 
                b.author_id,
                b.created_at, 
                b.updated_at,
                u.name as author_name,
                u.email as author_email
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            WHERE b.id = $1
        `;
        
        const result = await client.query(query, [id]);
        return result.rows[0] || null;
        
    } finally {
        client.release();
    }
}

// Get blogs by author ID
async function getBlogsByAuthor(authorId) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT 
                b.id, 
                b.title, 
                b.content, 
                b.author_id,
                b.created_at, 
                b.updated_at,
                u.name as author_name,
                u.email as author_email
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            WHERE b.author_id = $1
            ORDER BY b.created_at DESC
        `;
        
        const result = await client.query(query, [authorId]);
        return result.rows;
        
    } finally {
        client.release();
    }
}

// Search blogs by title or content
async function searchBlogs(searchTerm) {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT 
                b.id, 
                b.title, 
                b.content, 
                b.author_id,
                b.created_at, 
                b.updated_at,
                u.name as author_name,
                u.email as author_email
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            WHERE b.title ILIKE $1 OR b.content ILIKE $1
            ORDER BY b.created_at DESC
        `;
        
        const result = await client.query(query, [`%${searchTerm}%`]);
        return result.rows;
        
    } finally {
        client.release();
    }
}

// Update blog by ID
async function updateBlog(id, data) {
    const client = await pool.connect();
    
    try {
        const { title, content } = data;
        
        const query = `
            UPDATE blogs 
            SET title = COALESCE($1, title), 
                content = COALESCE($2, content),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 
            RETURNING id, title, content, author_id, created_at, updated_at
        `;
        
        const result = await client.query(query, [title, content, id]);
        return result.rows[0] || null;
        
    } finally {
        client.release();
    }
}

// Delete blog by ID
async function deleteBlog(id) {
    const client = await pool.connect();
    
    try {
        const query = `
            DELETE FROM blogs 
            WHERE id = $1 
            RETURNING id, title, author_id
        `;
        
        const result = await client.query(query, [id]);
        return result.rows[0] || null;
        
    } finally {
        client.release();
    }
}

// Get blog statistics
async function getBlogStats() {
    const client = await pool.connect();
    
    try {
        const query = `
            SELECT 
                COUNT(*) as total_blogs,
                COUNT(DISTINCT author_id) as total_authors,
                AVG(LENGTH(content)) as avg_content_length,
                MAX(created_at) as latest_blog_date
            FROM blogs
        `;
        
        const result = await client.query(query);
        return result.rows[0];
        
    } finally {
        client.release();
    }
}

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    getBlogsByAuthor,
    searchBlogs,
    updateBlog,
    deleteBlog,
    getBlogStats,
};
