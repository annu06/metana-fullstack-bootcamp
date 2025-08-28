const jwt = require('jsonwebtoken');
const config = require('../config');
const UserQueries = require('../db/userQueries');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Get user details from database
    const user = await UserQueries.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token - user not found' 
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }

  next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user.role === 'admin' || req.user.id == resourceUserId) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied - insufficient permissions' 
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin
};