const express = require('express');
const router = express.Router();
const db = require('../models/database');

// GET /api/blogs - Get all blogs
router.get('/', (req, res) => {
  const query = `SELECT id, title, content, excerpt, author, image_url, created_at, updated_at FROM blogs ORDER BY created_at DESC`;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching blogs:', err);
      res.status(500).json({ error: 'Failed to fetch blogs' });
      return;
    }
    res.json(rows);
  });
});

// GET /api/blogs/:id - Get single blog by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `SELECT id, title, content, excerpt, author, image_url, created_at, updated_at FROM blogs WHERE id = ?`;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching blog:', err);
      res.status(500).json({ error: 'Failed to fetch blog' });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }
    
    res.json(row);
  });
});

// POST /api/blogs - Create new blog
router.post('/', (req, res) => {
  const { title, content, excerpt, author, image_url } = req.body;
  
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }
  
  const query = `INSERT INTO blogs (title, content, excerpt, author, image_url) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [title, content, excerpt, author || 'Admin', image_url], function(err) {
    if (err) {
      console.error('Error creating blog:', err);
      res.status(500).json({ error: 'Failed to create blog' });
      return;
    }
    
    res.status(201).json({ 
      id: this.lastID, 
      message: 'Blog created successfully' 
    });
  });
});

// PUT /api/blogs/:id - Update blog
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, author, image_url } = req.body;
  
  const query = `UPDATE blogs SET title = ?, content = ?, excerpt = ?, author = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  db.run(query, [title, content, excerpt, author, image_url, id], function(err) {
    if (err) {
      console.error('Error updating blog:', err);
      res.status(500).json({ error: 'Failed to update blog' });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }
    
    res.json({ message: 'Blog updated successfully' });
  });
});

// DELETE /api/blogs/:id - Delete blog
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM blogs WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting blog:', err);
      res.status(500).json({ error: 'Failed to delete blog' });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }
    
    res.json({ message: 'Blog deleted successfully' });
  });
});

module.exports = router;