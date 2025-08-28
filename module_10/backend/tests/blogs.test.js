const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');

describe('Blog Routes', () => {
  let testUser;
  let authToken;
  let testBlog;

  beforeEach(async () => {
    // Create test user
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123'
    });
    await testUser.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create test blog
    testBlog = new Blog({
      title: 'Test Blog Post',
      content: 'This is a test blog post content that is long enough to meet requirements.',
      category: 'technology',
      author: testUser._id,
      status: 'published'
    });
    await testBlog.save();
  });

  describe('GET /api/blogs', () => {
    beforeEach(async () => {
      // Create additional test blogs
      const blogs = [
        {
          title: 'Published Blog 1',
          content: 'Content for published blog 1',
          category: 'technology',
          author: testUser._id,
          status: 'published'
        },
        {
          title: 'Draft Blog',
          content: 'Content for draft blog',
          category: 'lifestyle',
          author: testUser._id,
          status: 'draft'
        },
        {
          title: 'Published Blog 2',
          content: 'Content for published blog 2',
          category: 'travel',
          author: testUser._id,
          status: 'published'
        }
      ];

      await Blog.insertMany(blogs);
    });

    it('should get all published blogs', async () => {
      const response = await request(app)
        .get('/api/blogs')
        .expect(200);

      expect(response.body.blogs).toBeDefined();
      expect(response.body.blogs.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
      
      // Should only return published blogs
      response.body.blogs.forEach(blog => {
        expect(blog.status).toBe('published');
        expect(blog.author).toBeDefined();
        expect(blog.author.username).toBeDefined();
      });
    });

    it('should filter blogs by category', async () => {
      const response = await request(app)
        .get('/api/blogs?category=technology')
        .expect(200);

      response.body.blogs.forEach(blog => {
        expect(blog.category).toBe('technology');
      });
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/blogs?page=1&limit=2')
        .expect(200);

      expect(response.body.blogs.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalPages).toBeDefined();
    });

    it('should search blogs by text', async () => {
      const response = await request(app)
        .get('/api/blogs?search=Test')
        .expect(200);

      expect(response.body.blogs.length).toBeGreaterThan(0);
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/blogs?page=invalid&limit=invalid')
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/blogs/:id', () => {
    it('should get a single published blog', async () => {
      const response = await request(app)
        .get(`/api/blogs/${testBlog._id}`)
        .expect(200);

      expect(response.body.blog._id).toBe(testBlog._id.toString());
      expect(response.body.blog.title).toBe(testBlog.title);
      expect(response.body.blog.author.username).toBe(testUser.username);
      expect(response.body.blog.views).toBe(testBlog.views + 1); // Views should increment
    });

    it('should return 404 for non-existent blog', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/blogs/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('Blog not found');
    });

    it('should return 400 for invalid blog ID', async () => {
      const response = await request(app)
        .get('/api/blogs/invalid-id')
        .expect(400);

      expect(response.body.message).toBe('Invalid blog ID');
    });

    it('should not show draft blogs to non-authors', async () => {
      // Create draft blog
      const draftBlog = new Blog({
        title: 'Draft Blog',
        content: 'This is a draft blog',
        category: 'technology',
        author: testUser._id,
        status: 'draft'
      });
      await draftBlog.save();

      const response = await request(app)
        .get(`/api/blogs/${draftBlog._id}`)
        .expect(404);

      expect(response.body.message).toBe('Blog not found');
    });

    it('should show draft blogs to authors', async () => {
      // Create draft blog
      const draftBlog = new Blog({
        title: 'Draft Blog',
        content: 'This is a draft blog',
        category: 'technology',
        author: testUser._id,
        status: 'draft'
      });
      await draftBlog.save();

      const response = await request(app)
        .get(`/api/blogs/${draftBlog._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.blog._id).toBe(draftBlog._id.toString());
    });
  });

  describe('POST /api/blogs', () => {
    it('should create a new blog successfully', async () => {
      const blogData = {
        title: 'New Test Blog',
        content: 'This is the content of the new test blog post.',
        category: 'technology',
        tags: ['test', 'blog'],
        status: 'published'
      };

      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(blogData)
        .expect(201);

      expect(response.body.message).toBe('Blog created successfully');
      expect(response.body.blog.title).toBe(blogData.title);
      expect(response.body.blog.author._id).toBe(testUser._id.toString());
      expect(response.body.blog.tags).toEqual(blogData.tags);

      // Verify in database
      const createdBlog = await Blog.findById(response.body.blog._id);
      expect(createdBlog).toBeTruthy();
      expect(createdBlog.title).toBe(blogData.title);
    });

    it('should create draft blog by default', async () => {
      const blogData = {
        title: 'Draft Blog',
        content: 'This is a draft blog content.',
        category: 'technology'
      };

      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(blogData)
        .expect(201);

      expect(response.body.blog.status).toBe('draft');
    });

    it('should fail without authentication', async () => {
      const blogData = {
        title: 'New Test Blog',
        content: 'This is the content of the new test blog post.',
        category: 'technology'
      };

      const response = await request(app)
        .post('/api/blogs')
        .send(blogData)
        .expect(401);

      expect(response.body.message).toBe('No token provided, authorization denied');
    });

    it('should fail with invalid data', async () => {
      const blogData = {
        title: 'Hi', // Too short
        content: 'Short', // Too short
        category: 'invalid-category'
      };

      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(blogData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should auto-generate excerpt if not provided', async () => {
      const blogData = {
        title: 'Blog Without Excerpt',
        content: 'This is a very long content that should be used to generate an excerpt automatically when no excerpt is provided by the user.',
        category: 'technology'
      };

      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(blogData)
        .expect(201);

      expect(response.body.blog.excerpt).toBeDefined();
      expect(response.body.blog.excerpt.length).toBeLessThanOrEqual(153); // 150 + '...'
    });
  });

  describe('PUT /api/blogs/:id', () => {
    it('should update blog successfully by author', async () => {
      const updateData = {
        title: 'Updated Blog Title',
        content: 'Updated blog content that is long enough.',
        category: 'lifestyle'
      };

      const response = await request(app)
        .put(`/api/blogs/${testBlog._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Blog updated successfully');
      expect(response.body.blog.title).toBe(updateData.title);
      expect(response.body.blog.category).toBe(updateData.category);

      // Verify in database
      const updatedBlog = await Blog.findById(testBlog._id);
      expect(updatedBlog.title).toBe(updateData.title);
    });

    it('should fail to update blog by non-author', async () => {
      // Create another user
      const otherUser = new User({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'Password123'
      });
      await otherUser.save();

      const otherToken = jwt.sign(
        { userId: otherUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const updateData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/blogs/${testBlog._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.message).toBe('Not authorized to update this blog');
    });

    it('should fail without authentication', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/blogs/${testBlog._id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.message).toBe('No token provided, authorization denied');
    });

    it('should return 404 for non-existent blog', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/blogs/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Blog not found');
    });
  });

  describe('DELETE /api/blogs/:id', () => {
    it('should delete blog successfully by author', async () => {
      const response = await request(app)
        .delete(`/api/blogs/${testBlog._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Blog deleted successfully');

      // Verify blog is deleted from database
      const deletedBlog = await Blog.findById(testBlog._id);
      expect(deletedBlog).toBeNull();
    });

    it('should fail to delete blog by non-author', async () => {
      // Create another user
      const otherUser = new User({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'Password123'
      });
      await otherUser.save();

      const otherToken = jwt.sign(
        { userId: otherUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .delete(`/api/blogs/${testBlog._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.message).toBe('Not authorized to delete this blog');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/blogs/${testBlog._id}`)
        .expect(401);

      expect(response.body.message).toBe('No token provided, authorization denied');
    });

    it('should return 404 for non-existent blog', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/blogs/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('Blog not found');
    });
  });

  describe('GET /api/blogs/user/:userId', () => {
    beforeEach(async () => {
      // Create additional blogs for the user
      const blogs = [
        {
          title: 'User Blog 1',
          content: 'Content for user blog 1',
          category: 'technology',
          author: testUser._id,
          status: 'published'
        },
        {
          title: 'User Draft Blog',
          content: 'Content for user draft blog',
          category: 'lifestyle',
          author: testUser._id,
          status: 'draft'
        }
      ];

      await Blog.insertMany(blogs);
    });

    it('should get published blogs for a user', async () => {
      const response = await request(app)
        .get(`/api/blogs/user/${testUser._id}`)
        .expect(200);

      expect(response.body.blogs).toBeDefined();
      expect(response.body.blogs.length).toBeGreaterThan(0);
      
      // Should only return published blogs for non-author
      response.body.blogs.forEach(blog => {
        expect(blog.author._id).toBe(testUser._id.toString());
        expect(blog.status).toBe('published');
      });
    });

    it('should get all blogs for author', async () => {
      const response = await request(app)
        .get(`/api/blogs/user/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.blogs).toBeDefined();
      
      // Should return both published and draft blogs for author
      const statuses = response.body.blogs.map(blog => blog.status);
      expect(statuses).toContain('published');
      expect(statuses).toContain('draft');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get(`/api/blogs/user/${testUser._id}?page=1&limit=1`)
        .expect(200);

      expect(response.body.blogs.length).toBeLessThanOrEqual(1);
      expect(response.body.pagination).toBeDefined();
    });

    it('should return 400 for invalid user ID', async () => {
      const response = await request(app)
        .get('/api/blogs/user/invalid-id')
        .expect(400);

      expect(response.body.message).toBe('Invalid user ID');
    });
  });
});