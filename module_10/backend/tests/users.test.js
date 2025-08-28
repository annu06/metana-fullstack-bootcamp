const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');

describe('User Routes', () => {
  let testUser;
  let adminUser;
  let userToken;
  let adminToken;

  beforeEach(async () => {
    // Create regular test user
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      role: 'user'
    });
    await testUser.save();

    // Create admin user
    adminUser = new User({
      username: 'adminuser',
      email: 'admin@example.com',
      password: 'Password123',
      role: 'admin'
    });
    await adminUser.save();

    // Generate tokens
    userToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { userId: adminUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Create additional test users
      const users = [
        {
          username: 'user1',
          email: 'user1@example.com',
          password: 'Password123'
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          password: 'Password123'
        },
        {
          username: 'user3',
          email: 'user3@example.com',
          password: 'Password123',
          isActive: false
        }
      ];

      await User.insertMany(users);
    });

    it('should get all users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toBeDefined();
      expect(response.body.users.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
      
      // Should not include passwords
      response.body.users.forEach(user => {
        expect(user.password).toBeUndefined();
        expect(user.username).toBeDefined();
        expect(user.email).toBeDefined();
      });
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.message).toBe('No token provided, authorization denied');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.currentPage).toBe(1);
    });

    it('should handle search functionality', async () => {
      const response = await request(app)
        .get('/api/users?search=testuser')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users.length).toBeGreaterThan(0);
      response.body.users.forEach(user => {
        expect(
          user.username.toLowerCase().includes('testuser') ||
          user.email.toLowerCase().includes('testuser')
        ).toBeTruthy();
      });
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/users?page=invalid&limit=invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/users/:id', () => {
    let testBlog;

    beforeEach(async () => {
      // Create a test blog for the user
      testBlog = new Blog({
        title: 'Test Blog for User Profile',
        content: 'This is a test blog content for user profile testing.',
        category: 'technology',
        author: testUser._id,
        status: 'published'
      });
      await testBlog.save();
    });

    it('should get user profile with blog statistics', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser._id}`)
        .expect(200);

      expect(response.body.user._id).toBe(testUser._id.toString());
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user.blogCount).toBeDefined();
      expect(response.body.user.recentBlogs).toBeDefined();
      expect(response.body.user.blogCount).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should return 400 for invalid user ID', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .expect(400);

      expect(response.body.message).toBe('Invalid user ID');
    });

    it('should only count published blogs', async () => {
      // Create a draft blog
      const draftBlog = new Blog({
        title: 'Draft Blog',
        content: 'This is a draft blog content.',
        category: 'technology',
        author: testUser._id,
        status: 'draft'
      });
      await draftBlog.save();

      const response = await request(app)
        .get(`/api/users/${testUser._id}`)
        .expect(200);

      // Should only count published blogs
      expect(response.body.user.blogCount).toBe(1);
      expect(response.body.user.recentBlogs.length).toBe(1);
      expect(response.body.user.recentBlogs[0].status).toBe('published');
    });
  });

  describe('PUT /api/users/:id/status', () => {
    it('should activate/deactivate user by admin', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(200);

      expect(response.body.message).toBe('User deactivated successfully');
      expect(response.body.user.isActive).toBe(false);

      // Verify in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.isActive).toBe(false);
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ isActive: false })
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should prevent admin from deactivating themselves', async () => {
      const response = await request(app)
        .put(`/api/users/${adminUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(400);

      expect(response.body.message).toBe('Cannot deactivate your own account');
    });

    it('should fail with invalid isActive value', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: 'invalid' })
        .expect(400);

      expect(response.body.message).toBe('isActive must be a boolean value');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/users/${fakeId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/users/:id/role', () => {
    it('should update user role by admin', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body.message).toBe('User role updated to admin successfully');
      expect(response.body.user.role).toBe('admin');

      // Verify in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.role).toBe('admin');
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser._id}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' })
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should prevent admin from changing their own role', async () => {
      const response = await request(app)
        .put(`/api/users/${adminUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'user' })
        .expect(400);

      expect(response.body.message).toBe('Cannot change your own role');
    });

    it('should fail with invalid role', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'invalid-role' })
        .expect(400);

      expect(response.body.message).toBe('Role must be either "user" or "admin"');
    });
  });

  describe('DELETE /api/users/:id', () => {
    let userWithBlogs;

    beforeEach(async () => {
      // Create user with blogs
      userWithBlogs = new User({
        username: 'userwithblogs',
        email: 'userwithblogs@example.com',
        password: 'Password123'
      });
      await userWithBlogs.save();

      // Create blogs for this user
      const blogs = [
        {
          title: 'Blog 1',
          content: 'Content for blog 1',
          category: 'technology',
          author: userWithBlogs._id,
          status: 'published'
        },
        {
          title: 'Blog 2',
          content: 'Content for blog 2',
          category: 'lifestyle',
          author: userWithBlogs._id,
          status: 'draft'
        }
      ];
      await Blog.insertMany(blogs);
    });

    it('should delete user and associated blogs by admin', async () => {
      const response = await request(app)
        .delete(`/api/users/${userWithBlogs._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('User and associated blogs deleted successfully');

      // Verify user is deleted
      const deletedUser = await User.findById(userWithBlogs._id);
      expect(deletedUser).toBeNull();

      // Verify associated blogs are deleted
      const userBlogs = await Blog.find({ author: userWithBlogs._id });
      expect(userBlogs.length).toBe(0);
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should prevent admin from deleting themselves', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.message).toBe('Cannot delete your own account');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('GET /api/users/stats/overview', () => {
    beforeEach(async () => {
      // Create additional users and blogs for statistics
      const users = [
        {
          username: 'activeuser1',
          email: 'active1@example.com',
          password: 'Password123',
          isActive: true
        },
        {
          username: 'inactiveuser1',
          email: 'inactive1@example.com',
          password: 'Password123',
          isActive: false
        }
      ];
      const createdUsers = await User.insertMany(users);

      // Create blogs
      const blogs = [
        {
          title: 'Published Blog 1',
          content: 'Content for published blog 1',
          category: 'technology',
          author: createdUsers[0]._id,
          status: 'published'
        },
        {
          title: 'Draft Blog 1',
          content: 'Content for draft blog 1',
          category: 'lifestyle',
          author: createdUsers[0]._id,
          status: 'draft'
        }
      ];
      await Blog.insertMany(blogs);
    });

    it('should get statistics overview for admin', async () => {
      const response = await request(app)
        .get('/api/users/stats/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toBeDefined();
      expect(response.body.users.total).toBeGreaterThan(0);
      expect(response.body.users.active).toBeDefined();
      expect(response.body.users.admins).toBeDefined();
      expect(response.body.users.recentSignups).toBeDefined();

      expect(response.body.blogs).toBeDefined();
      expect(response.body.blogs.total).toBeGreaterThan(0);
      expect(response.body.blogs.published).toBeDefined();
      expect(response.body.blogs.drafts).toBeDefined();
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users/stats/overview')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/users/stats/overview')
        .expect(401);

      expect(response.body.message).toBe('No token provided, authorization denied');
    });
  });
});