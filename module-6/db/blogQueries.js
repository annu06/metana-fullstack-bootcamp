const { query } = require('./dbconn');

// Get all blogs with author information
async function getAllBlogs() {
  try {
    const result = await query(`
      SELECT 
        b.id, 
        b.title, 
        b.content, 
        b.published, 
        b.created_at, 
        b.updated_at,
        u.id as author_id,
        u.username as author_username,
        u.first_name as author_first_name,
        u.last_name as author_last_name
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      ORDER BY b.created_at DESC
    `);
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      published: row.published,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        id: row.author_id,
        username: row.author_username,
        first_name: row.author_first_name,
        last_name: row.author_last_name
      }
    }));
  } catch (error) {
    throw new Error(`Error fetching blogs: ${error.message}`);
  }
}

// Get published blogs only
async function getPublishedBlogs() {
  try {
    const result = await query(`
      SELECT 
        b.id, 
        b.title, 
        b.content, 
        b.published, 
        b.created_at, 
        b.updated_at,
        u.id as author_id,
        u.username as author_username,
        u.first_name as author_first_name,
        u.last_name as author_last_name
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE b.published = true
      ORDER BY b.created_at DESC
    `);
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      published: row.published,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        id: row.author_id,
        username: row.author_username,
        first_name: row.author_first_name,
        last_name: row.author_last_name
      }
    }));
  } catch (error) {
    throw new Error(`Error fetching published blogs: ${error.message}`);
  }
}

// Get blog by ID with author information
async function getBlogById(id) {
  try {
    const result = await query(`
      SELECT 
        b.id, 
        b.title, 
        b.content, 
        b.published, 
        b.created_at, 
        b.updated_at,
        u.id as author_id,
        u.username as author_username,
        u.first_name as author_first_name,
        u.last_name as author_last_name
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE b.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      published: row.published,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        id: row.author_id,
        username: row.author_username,
        first_name: row.author_first_name,
        last_name: row.author_last_name
      }
    };
  } catch (error) {
    throw new Error(`Error fetching blog by ID: ${error.message}`);
  }
}

// Get blogs by author ID
async function getBlogsByAuthor(authorId) {
  try {
    const result = await query(`
      SELECT 
        b.id, 
        b.title, 
        b.content, 
        b.published, 
        b.created_at, 
        b.updated_at,
        u.id as author_id,
        u.username as author_username,
        u.first_name as author_first_name,
        u.last_name as author_last_name
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE b.author_id = $1
      ORDER BY b.created_at DESC
    `, [authorId]);
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      published: row.published,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        id: row.author_id,
        username: row.author_username,
        first_name: row.author_first_name,
        last_name: row.author_last_name
      }
    }));
  } catch (error) {
    throw new Error(`Error fetching blogs by author: ${error.message}`);
  }
}

// Create a new blog
async function createBlog(blogData) {
  const { title, content, author_id, published = false } = blogData;
  
  try {
    const result = await query(
      `INSERT INTO blogs (title, content, author_id, published) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, title, content, author_id, published, created_at, updated_at`,
      [title, content, author_id, published]
    );
    
    // Get the blog with author information
    const blog = await getBlogById(result.rows[0].id);
    return blog;
  } catch (error) {
    if (error.code === '23503') { // Foreign key constraint violation
      throw new Error('Author not found');
    }
    throw new Error(`Error creating blog: ${error.message}`);
  }
}

// Update blog
async function updateBlog(id, blogData) {
  const { title, content, published } = blogData;
  
  try {
    const result = await query(
      `UPDATE blogs 
       SET title = COALESCE($2, title), 
           content = COALESCE($3, content), 
           published = COALESCE($4, published)
       WHERE id = $1 
       RETURNING id`,
      [id, title, content, published]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Blog not found');
    }
    
    // Get the updated blog with author information
    const blog = await getBlogById(id);
    return blog;
  } catch (error) {
    throw new Error(`Error updating blog: ${error.message}`);
  }
}

// Delete blog
async function deleteBlog(id) {
  try {
    const result = await query(
      'DELETE FROM blogs WHERE id = $1 RETURNING id, title',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Blog not found');
    }
    
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error deleting blog: ${error.message}`);
  }
}

// Search blogs by title or content
async function searchBlogs(searchTerm) {
  try {
    const result = await query(`
      SELECT 
        b.id, 
        b.title, 
        b.content, 
        b.published, 
        b.created_at, 
        b.updated_at,
        u.id as author_id,
        u.username as author_username,
        u.first_name as author_first_name,
        u.last_name as author_last_name
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE (b.title ILIKE $1 OR b.content ILIKE $1) AND b.published = true
      ORDER BY b.created_at DESC
    `, [`%${searchTerm}%`]);
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      published: row.published,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        id: row.author_id,
        username: row.author_username,
        first_name: row.author_first_name,
        last_name: row.author_last_name
      }
    }));
  } catch (error) {
    throw new Error(`Error searching blogs: ${error.message}`);
  }
}

module.exports = {
  getAllBlogs,
  getPublishedBlogs,
  getBlogById,
  getBlogsByAuthor,
  createBlog,
  updateBlog,
  deleteBlog,
  searchBlogs
};