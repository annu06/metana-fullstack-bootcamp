const request = require('supertest');
const app = require('../app');
const Task = require('../models/Task');
const User = require('../models/User');

describe('Task API', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
        // Clear database
        await Task.deleteMany({});
        await User.deleteMany({});

        // Create test user
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: '123456'
        });

        userId = user._id;

        // Login to get token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: '123456'
            });

        authToken = loginResponse.body.token;
    });

    describe('GET /api/tasks', () => {
        test('should get all tasks for authenticated user', async () => {
            // Create test tasks
            await Task.create([
                {
                    title: 'Test Task 1',
                    duration: '30 mins',
                    time: '09:00 AM',
                    user: userId
                },
                {
                    title: 'Test Task 2',
                    duration: '45 mins',
                    time: '10:00 AM',
                    user: userId
                }
            ]);

            const response = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0].title).toBe('Test Task 2'); // Should be sorted by createdAt desc
        });

        test('should return 401 without auth token', async () => {
            await request(app)
                .get('/api/tasks')
                .expect(401);
        });
    });

    describe('POST /api/tasks', () => {
        test('should create a new task', async () => {
            const taskData = {
                title: 'New Test Task',
                duration: '60 mins',
                time: '02:00 PM',
                mood: 'focused'
            };

            const response = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send(taskData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(taskData.title);
            expect(response.body.data.user).toBe(userId.toString());
        });

        test('should return 400 for invalid task data', async () => {
            const invalidData = {
                duration: '30 mins'
                // Missing required title and time
            };

            const response = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/tasks/:id', () => {
        test('should update an existing task', async () => {
            const task = await Task.create({
                title: 'Original Task',
                duration: '30 mins',
                time: '09:00 AM',
                user: userId
            });

            const updateData = {
                title: 'Updated Task',
                status: 'completed'
            };

            const response = await request(app)
                .put(`/api/tasks/${task._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Updated Task');
            expect(response.body.data.status).toBe('completed');
        });

        test('should return 404 for non-existent task', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            await request(app)
                .put(`/api/tasks/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'Updated' })
                .expect(404);
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        test('should delete a task', async () => {
            const task = await Task.create({
                title: 'Task to Delete',
                duration: '30 mins',
                time: '09:00 AM',
                user: userId
            });

            await request(app)
                .delete(`/api/tasks/${task._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const deletedTask = await Task.findById(task._id);
            expect(deletedTask).toBeNull();
        });
    });
});