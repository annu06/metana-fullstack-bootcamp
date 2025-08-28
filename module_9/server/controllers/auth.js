const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const UserQueries = require('../db/userQueries');
const config = require('../config');

class AuthController {
  // User Registration
  static async register(req, res) {
    try {
      const { username, email, password, role = 'user' } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
      }

      // Validate email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Validate password strength
      if (!validator.isLength(password, { min: 6 })) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Validate username
      if (!validator.isLength(username, { min: 3, max: 20 })) {
        return res.status(400).json({
          success: false,
          message: 'Username must be between 3 and 20 characters'
        });
      }

      // Check if username already exists
      const usernameExists = await UserQueries.usernameExists(username);
      if (usernameExists) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }

      // Check if email already exists
      const emailExists = await UserQueries.emailExists(email);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Validate role
      const validRoles = ['user', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be either "user" or "admin"'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = await UserQueries.createUser(username, email, hashedPassword, role);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          username: newUser.username, 
          role: newUser.role 
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            created_at: newUser.created_at
          },
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  // User Login
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validation
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Find user by username
      const user = await UserQueries.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at
          },
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await UserQueries.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at
          }
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Verify token endpoint
  static async verifyToken(req, res) {
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  }
}

module.exports = AuthController;