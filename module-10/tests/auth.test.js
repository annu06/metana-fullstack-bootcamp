const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Mock models
jest.mock('../models/User');
jest.mock('../models/Task');

describe('Auth Routes Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user123',
        name: userData.name,
        email: userData.email,
        role: 'user',
        getSignedJwtToken: jest.fn().mockReturnValue('mock-jwt-token')
      };

      User.findByEmail = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe('mock-jwt-token');
      expect(response.body.user.email).toBe(userData.email);
      expect(User.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(User.create).toHaveBeenCalledWith(userData);
    });

    test('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User'
          // Missing email and password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Name, email, and password are required');
    });

    test('should return 400 if user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };

      User.findByEmail = jest.fn().mockResolvedValue({ email: userData.email });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists with this email');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: loginData.email,
        role: 'user',
        matchPassword: jest.fn().mockResolvedValue(true),
        updateLastLogin: jest.fn().mockResolvedValue(true),
        getSignedJwtToken: jest.fn().mockReturnValue('mock-jwt-token')
      };

      User.findByEmail = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe('mock-jwt-token');
      expect(mockUser.matchPassword).toHaveBeenCalledWith(loginData.password);
      expect(mockUser.updateLastLogin).toHaveBeenCalled();
    });

    test('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      User.findByEmail = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and password are required');
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return current user when authenticated', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      User.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      // Mock JWT verification
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({ id: 'user123', email: 'test@example.com' });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe('user123');
    });

    test('should return 401 when no token provided', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('PUT /api/auth/updatepassword', () => {
    test('should update password successfully', async () => {
      const updateData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      };

      const mockUser = {
        _id: 'user123',
        password: 'hashedpassword',
        matchPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        getSignedJwtToken: jest.fn().mockReturnValue('new-token')
      };

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // Mock JWT verification
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({ id: 'user123' });

      const response = await request(app)
        .put('/api/auth/updatepassword')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe('new-token');
      expect(mockUser.matchPassword).toHaveBeenCalledWith(updateData.currentPassword);
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('should return 401 for incorrect current password', async () => {
      const updateData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const mockUser = {
        matchPassword: jest.fn().mockResolvedValue(false)
      };

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // Mock JWT verification
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({ id: 'user123' });

      const response = await request(app)
        .put('/api/auth/updatepassword')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Current password is incorrect');
    });
  });
});