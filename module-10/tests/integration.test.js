const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

describe('Full Integration Tests', () => {
  let server;
  let testUser;
  let authToken;
  let testTask;

  beforeAll(async () => {
    // Connect to test database
    const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/mood-todo-test';
    await mongoose.connect(MONGODB_URI);
    
    // Start server
    server = app.listen(0);
  });

  afterAll(async () => {
    // Clean up
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Task.deleteMany({});

    // Create test user
    const userData = {
      name: 'Integration Test User',
      email: 'integration@test.com',
      password: 'testpassword123'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    testUser = registerResponse.body.user;
    authToken = registerResponse.body.token;

    // Create test task
    const taskData = {
      title: 'Integration Test Task',
      description: 'A task for integration testing',
      mood: 'excited',
      priority: 'high',
      category: 'work'
    };

    const taskResponse = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(taskData)
      .expect(201);

    testTask = taskResponse.body.data;
  });

  describe('Complete User Journey', () => {
    test('should complete full user workflow', async () => {
      // 1. User registration (already done in beforeEach)
      expect(testUser).toBeDefined();
      expect(authToken).toBeDefined();

      // 2. User login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'testpassword123'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      const newToken = loginResponse.body.token;

      // 3. Create multiple tasks with different moods
      const tasks = [
        { title: 'Happy Task', mood: 'happy', priority: 'low' },
        { title: 'Anxious Task', mood: 'anxious', priority: 'high' },
        { title: 'Calm Task', mood: 'calm', priority: 'medium' }
      ];

      const createdTasks = [];
      for (const taskData of tasks) {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${newToken}`)
          .send(taskData)
          .expect(201);

        createdTasks.push(response.body.data);
      }

      // 4. Get all tasks
      const allTasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(allTasksResponse.body.data).toHaveLength(4); // 3 new + 1 from beforeEach

      // 5. Filter tasks by mood
      const happyTasksResponse = await request(app)
        .get('/api/tasks/mood/happy')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(happyTasksResponse.body.data).toHaveLength(1);
      expect(happyTasksResponse.body.data[0].mood).toBe('happy');

      // 6. Update a task
      const taskToUpdate = createdTasks[0];
      const updateResponse = await request(app)
        .put(`/api/tasks/${taskToUpdate._id}`)
        .set('Authorization', `Bearer ${newToken}`)
        .send({
          title: 'Updated Happy Task',
          status: 'completed'
        })
        .expect(200);

      expect(updateResponse.body.data.title).toBe('Updated Happy Task');
      expect(updateResponse.body.data.status).toBe('completed');
      expect(updateResponse.body.data.completedAt).toBeDefined();

      // 7. Get user profile
      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(profileResponse.body.data.email).toBe('integration@test.com');

      // 8. Update user details
      const updateUserResponse = await request(app)
        .put('/api/auth/updatedetails')
        .set('Authorization', `Bearer ${newToken}`)
        .send({
          name: 'Updated Integration User'
        })
        .expect(200);

      expect(updateUserResponse.body.data.name).toBe('Updated Integration User');

      // 9. Delete a task
      const taskToDelete = createdTasks[1];
      await request(app)
        .delete(`/api/tasks/${taskToDelete._id}`)
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      // Verify deletion
      const finalTasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(finalTasksResponse.body.data).toHaveLength(3);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle authentication errors properly', async () => {
      // Access protected route without token
      await request(app)
        .get('/api/tasks')
        .expect(401);

      // Access protected route with invalid token
      await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      // Create task with invalid data
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '', // Invalid: empty title
          mood: 'invalid_mood' // Invalid mood
        })
        .expect(400);
    });

    test('should handle resource not found errors', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      // Get non-existent task
      await request(app)
        .get(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Update non-existent task
      await request(app)
        .put(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      // Delete non-existent task
      await request(app)
        .delete(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Performance and Caching', () => {
    test('should handle multiple concurrent requests', async () => {
      const promises = [];
      
      // Create 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              title: `Concurrent Task ${i}`,
              mood: 'excited',
              priority: 'medium'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all tasks were created
      const allTasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(allTasksResponse.body.data).toHaveLength(11); // 10 new + 1 from beforeEach
    });

    test('should return cached responses when appropriate', async () => {
      // First request (will be cached)
      const response1 = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Second request (should use cache)
      const response2 = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Responses should be identical
      expect(response1.body).toEqual(response2.body);
    });
  });

  describe('Data Validation and Security', () => {
    test('should validate input data properly', async () => {
      // Test various invalid inputs
      const invalidInputs = [
        { title: 'x'.repeat(101), mood: 'happy' }, // Title too long
        { title: 'Valid Title', mood: 'invalid' }, // Invalid mood
        { title: 'Valid Title', mood: 'happy', priority: 'invalid' }, // Invalid priority
        { title: 'Valid Title', mood: 'happy', dueDate: '2020-01-01' } // Past due date
      ];

      for (const input of invalidInputs) {
        await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send(input)
          .expect(400);
      }
    });

    test('should prevent access to other users data', async () => {
      // Create second user
      const secondUserData = {
        name: 'Second User',
        email: 'second@test.com',
        password: 'password123'
      };

      const secondUserResponse = await request(app)
        .post('/api/auth/register')
        .send(secondUserData)
        .expect(201);

      const secondUserToken = secondUserResponse.body.token;

      // Second user should not see first user's tasks
      const tasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200);

      expect(tasksResponse.body.data).toHaveLength(0);

      // Second user should not be able to access first user's task
      await request(app)
        .get(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(404); // Should return 404, not 403, to not reveal existence
    });
  });

  describe('API Documentation and Health Checks', () => {
    test('should provide API documentation', async () => {
      const response = await request(app)
        .get('/docs')
        .expect(200);

      expect(response.body.version).toBeDefined();
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.endpoints.auth).toBeDefined();
      expect(response.body.endpoints.tasks).toBeDefined();
    });

    test('should provide health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.message).toBe('OK');
      expect(response.body.uptime).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Advanced Task Features', () => {
    test('should handle subtasks correctly', async () => {
      // Create task with subtasks
      const taskWithSubtasks = await Task.create({
        title: 'Task with Subtasks',
        description: 'Testing subtask functionality',
        mood: 'motivated',
        user: testUser._id,
        subtasks: [
          { title: 'Subtask 1', completed: false },
          { title: 'Subtask 2', completed: true }
        ]
      });

      // Check completion percentage
      expect(taskWithSubtasks.completionPercentage).toBe(50);

      // Add another subtask
      await taskWithSubtasks.addSubtask('Subtask 3');
      expect(taskWithSubtasks.subtasks).toHaveLength(3);

      // Complete a subtask
      const subtaskId = taskWithSubtasks.subtasks[0]._id;
      await taskWithSubtasks.completeSubtask(subtaskId);
      
      expect(taskWithSubtasks.subtasks[0].completed).toBe(true);
      expect(taskWithSubtasks.completionPercentage).toBe(67); // 2 out of 3 completed
    });

    test('should handle task statistics correctly', async () => {
      // Create tasks with different statuses
      await Task.create([
        { title: 'Task 1', mood: 'happy', status: 'completed', user: testUser._id },
        { title: 'Task 2', mood: 'sad', status: 'pending', user: testUser._id },
        { title: 'Task 3', mood: 'excited', status: 'in-progress', user: testUser._id }
      ]);

      const stats = await Task.getTaskStats(testUser._id);
      
      expect(stats).toHaveLength(4); // 3 new + 1 from beforeEach
      
      const statusCounts = stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

      expect(statusCounts.completed).toBe(1);
      expect(statusCounts.pending).toBe(2); // 1 new + 1 from beforeEach
      expect(statusCounts['in-progress']).toBe(1);
    });
  });
});