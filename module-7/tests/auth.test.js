const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Auth API', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        test('should register a new user', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: '123456'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.data.email).toBe(userData.email);
            expect(response.body.data.password).toBeUndefined();
        });

        test('should not register user with existing email', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: '123456'
            };

            // Register first user
            await User.create(userData);

            // Try to register with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User already exists');
        });

        test('should validate required fields', async () => {
            const invalidData = {
                name: 'John'
                // Missing email and password
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: '123456'
            });
        });

        test('should login with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: '123456'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.data.email).toBe(loginData.email);
        });

        test('should not login with invalid credentials', async () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(invalidData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });

        test('should not login with non-existent user', async () => {
            const nonExistentUser = {
                email: 'nonexistent@example.com',
                password: '123456'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(nonExistentUser)
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/me', () => {
        let authToken;

        beforeEach(async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: '123456'
            });

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: '123456'
                });

            authToken = loginResponse.body.token;
        });

        test('should get current user with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('test@example.com');
        });

        test('should return 401 without token', async () => {
            await request(app)
                .get('/api/auth/me')
                .expect(401);
        });

        test('should return 401 with invalid token', async () => {
            await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalidtoken')
                .expect(401);
        });
    });
});