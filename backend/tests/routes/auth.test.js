import request from 'supertest';
import app from '../../src/index.js';
import { User } from '../../src/models/User.js';
import * as dbHandler from '../setup.js';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Auth Routes', () => {
    const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
    };

    describe('Basic Routes', () => {
        it('should get root route', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toEqual(200);
            expect(res.text).toContain('Goodreads Clone API');
        });

        it('should get test route', async () => {
            const res = await request(app).get('/api/test');
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('API is working');
        });
    });

    describe('POST /api/users/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send(userData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.user.email).toEqual(userData.email);
            expect(res.body.token).toBeDefined();
        });

        it('should not register user with existing email', async () => {
            await User.create(userData);
            const res = await request(app)
                .post('/api/users/register')
                .send(userData);

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual("User already exists")
        });
    });

    describe('POST /api/users/login', () => {
        it('should login existing user', async () => {
            await request(app).post('/api/users/register').send(userData);
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });
            expect(res.statusCode).toEqual(200);
        });

        it('should not login non-existing user', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'none@test.com',
                    password: 'none-password'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual("Invalid credentials");
        });

        it('should not login with wrong credentials', async () => {
            await request(app).post('/api/users/register').send(userData);
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: userData.email,
                    password: 'wrongpassword'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual("Invalid credentials");
        });
    });

    describe("POST /api/users/logout", () => {
        it('should logout user', async () => {
            const registerRes = await request(app).post('/api/users/register').send(userData);
            const token = registerRes.body.token;
            const res = await request(app)
                .post('/api/users/logout')
                .set('Cookie', [`token=${token}`]);
            expect(res.statusCode).toEqual(200);
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.headers['set-cookie'][0]).toContain('token=;');
        });
    });

    describe('GET /api/users/profile', () => {
        it('should get and update profile', async () => {
            const registerRes = await request(app).post('/api/users/register').send(userData);
            const token = registerRes.body.token;

            const getRes = await request(app)
                .get('/api/users/profile')
                .set('Cookie', [`token=${token}`]);
            expect(getRes.statusCode).toEqual(200);

            const putRes = await request(app)
                .put('/api/users/profile')
                .set('Cookie', [`token=${token}`])
                .send({ name: 'Updated' });
            expect(putRes.body.name).toEqual('Updated');
        });
        it('should return 404 if profile not found', async () => {
            const token = jwt.sign({ userId: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET);

            const getRes = await request(app)
                .get('/api/users/profile')
                .set('Cookie', [`token=${token}`]);
            expect(getRes.statusCode).toEqual(404);
        });

        it('should return 400 if email is already taken', async () => {
            const registerRes = await request(app).post('/api/users/register').send(userData);
            await request(app).post('/api/users/register').send({ email: "test@test.com", password: "password", name: "test" });

            const token = registerRes.body.token;

            const putRes = await request(app)
                .put('/api/users/profile')
                .set('Cookie', [`token=${token}`])
                .send({ email: 'test@test.com' });
            expect(putRes.statusCode).toEqual(400);
            expect(putRes.body.message).toEqual("Email is already taken");
        });
    });

    describe('Error Handling', () => {
        it('should handle catch blocks', async () => {
            const spy = jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Fail'));
            const res = await request(app).post('/api/users/register').send(userData);
            expect(res.statusCode).toEqual(500);
            spy.mockRestore();
        });
    });
});
