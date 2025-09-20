const request = require('supertest');
const app = require('../app');
const Task = require('../models/Task');

// Mock models
jest.mock('../models/Task');
jest.mock('../models/User');

describe('Task Routes Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock JWT verification
    const jwt = require('jsonwebtoken');
    jwt.verify = jest.fn().mockReturnValue({ id: 'user123', email: 'test@example.com' });
  });

  describe('GET /api/tasks', () => {
    test('should get all tasks for authenticated user', async () => {
      const mockTasks = [
        {
          _id: 'task1',
          title: 'Test Task 1',
          mood: 'happy',
          status: 'pending',
          user: 'user123'
        },
        {
          _id: 'task2',
          title: 'Test Task 2',
          mood: 'excited',
          status: 'completed',
          user: 'user123'
        }
      ];

      Task.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockResolvedValue(mockTasks)
          })
        })
      });

      Task.countDocuments = jest.fn().mockResolvedValue(2);

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toEqual(mockTasks);
    });

    test('should filter tasks by mood', async () => {
      const mockTasks = [
        {
          _id: 'task1',
          title: 'Happy Task',
          mood: 'happy',
          status: 'pending',
          user: 'user123'
        }
      ];

      Task.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockResolvedValue(mockTasks)
          })
        })
      });

      Task.countDocuments = jest.fn().mockResolvedValue(1);

      const response = await request(app)
        .get('/api/tasks?mood=happy')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(Task.find).toHaveBeenCalledWith({ user: 'user123', mood: 'happy' });
    });

    test('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/tasks');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('should get single task by id', async () => {
      const mockTask = {
        _id: 'task123',
        title: 'Test Task',
        mood: 'calm',
        user: 'user123'
      };

      Task.findOne = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .get('/api/tasks/task123')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTask);
      expect(Task.findOne).toHaveBeenCalledWith({
        _id: 'task123',
        user: 'user123'
      });
    });

    test('should return 404 when task not found', async () => {
      Task.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tasks/nonexistent')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });
  });

  describe('POST /api/tasks', () => {
    test('should create new task successfully', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        mood: 'motivated',
        priority: 'high'
      };

      const mockTask = {
        _id: 'new-task-id',
        ...taskData,
        user: 'user123'
      };

      Task.create = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer valid-token')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe('new-task-id');
      expect(Task.create).toHaveBeenCalledWith({
        ...taskData,
        user: 'user123'
      });
    });

    test('should validate required fields', async () => {
      const invalidTaskData = {
        description: 'Task without title and mood'
      };

      Task.create = jest.fn().mockRejectedValue(
        new Error('Task validation failed: title: Task title is required, mood: Mood is required')
      );

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer valid-token')
        .send(invalidTaskData);

      expect(response.status).toBe(500); // Error handler would process this
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'completed'
      };

      const existingTask = {
        _id: 'task123',
        title: 'Original Task',
        user: 'user123'
      };

      const updatedTask = {
        ...existingTask,
        ...updateData
      };

      Task.findOne = jest.fn().mockResolvedValue(existingTask);
      Task.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedTask);

      const response = await request(app)
        .put('/api/tasks/task123')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Task');
      expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
        'task123',
        updateData,
        {
          new: true,
          runValidators: true
        }
      );
    });

    test('should return 404 when updating non-existent task', async () => {
      Task.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put('/api/tasks/nonexistent')
        .set('Authorization', 'Bearer valid-token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should delete task successfully', async () => {
      const mockTask = {
        _id: 'task123',
        title: 'Task to Delete',
        user: 'user123',
        deleteOne: jest.fn().mockResolvedValue(true)
      };

      Task.findOne = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .delete('/api/tasks/task123')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockTask.deleteOne).toHaveBeenCalled();
    });

    test('should return 404 when deleting non-existent task', async () => {
      Task.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/tasks/nonexistent')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });
  });

  describe('GET /api/tasks/mood/:mood', () => {
    test('should get tasks by mood', async () => {
      const mockTasks = [
        {
          _id: 'task1',
          title: 'Happy Task 1',
          mood: 'happy',
          user: 'user123'
        },
        {
          _id: 'task2',
          title: 'Happy Task 2',
          mood: 'happy',
          user: 'user123'
        }
      ];

      Task.getTasksByMood = jest.fn().mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/api/tasks/mood/happy')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toEqual(mockTasks);
      expect(Task.getTasksByMood).toHaveBeenCalledWith('user123', 'happy');
    });
  });

  describe('GET /api/tasks/overdue', () => {
    test('should get overdue tasks', async () => {
      const mockOverdueTasks = [
        {
          _id: 'task1',
          title: 'Overdue Task',
          dueDate: new Date('2023-01-01'),
          user: 'user123'
        }
      ];

      Task.getOverdueTasks = jest.fn().mockResolvedValue(mockOverdueTasks);

      const response = await request(app)
        .get('/api/tasks/overdue')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data).toEqual(mockOverdueTasks);
      expect(Task.getOverdueTasks).toHaveBeenCalledWith('user123');
    });
  });
});