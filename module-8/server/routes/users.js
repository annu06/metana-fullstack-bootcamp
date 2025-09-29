const express = require('express');
const router = express.Router();
const db = require('../models/database');

// GET /api/users - Get all users (for admin)
router.get('/', (req, res) => {
  const query = `SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC`;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
      return;
    }
    res.json(rows);
  });
});

// GET /api/users/:id - Get single user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `SELECT id, username, email, role, created_at FROM users WHERE id = ?`;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'Failed to fetch user' });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(row);
  });
});

// POST /api/users/register - Register new user (simplified for demo)
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email and password are required' });
    return;
  }
  
  // In a real app, you would hash the password
  const password_hash = password; // This should be hashed with bcrypt
  
  const query = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
  
  db.run(query, [username, email, password_hash], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        res.status(409).json({ error: 'Username or email already exists' });
      } else {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Failed to create user' });
      }
      return;
    }
    
    res.status(201).json({ 
      id: this.lastID, 
      message: 'User registered successfully' 
    });
  });
});

// POST /api/users/login - Login user (simplified for demo)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  
  const query = `SELECT id, username, email, role FROM users WHERE username = ? AND password_hash = ?`;
  
  db.get(query, [username, password], (err, row) => {
    if (err) {
      console.error('Error during login:', err);
      res.status(500).json({ error: 'Login failed' });
      return;
    }
    
    if (!row) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // In a real app, you would return a JWT token
    res.json({ 
      message: 'Login successful',
      user: row
    });
  });
});

module.exports = router;