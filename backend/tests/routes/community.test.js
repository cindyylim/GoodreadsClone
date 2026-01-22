import request from 'supertest';
import app from '../../src/index.js';
import mongoose from 'mongoose';
import * as dbHandler from '../setup.js';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Community Routes', () => {
    let token;
    let userId;

    beforeEach(async () => {
        const userRes = await request(app).post('/api/users/register').send({
            name: 'Test',
            email: 'test@example.com',
            password: 'password123'
        });
        token = userRes.body.token;
        userId = userRes.body.user._id;
    });

    describe('GET /api/users/:id', () => {
        it('should get public user profile', async () => {
            const res = await request(app).get(`/api/users/${userId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.name).toEqual('Test');
            expect(res.body.email).toBeUndefined(); // Should not return email
        });

        it('should return 404 if user not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/users/${fakeId}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('Follow Functionality', () => {
        let otherId;

        beforeEach(async () => {
            const otherRes = await request(app).post('/api/users/register').send({
                name: 'Other',
                email: 'other@example.com',
                password: 'password123'
            });
            otherId = otherRes.body.user._id;
        });

        it('should follow a user', async () => {
            const res = await request(app)
                .post(`/api/users/${otherId}/follow`)
                .set('Cookie', [`token=${token}`]);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Successfully followed user');

            const statusRes = await request(app)
                .get(`/api/users/${otherId}/follow-status`)
                .set('Cookie', [`token=${token}`]);
            expect(statusRes.body.isFollowing).toBe(true);
        });

        it('should not follow self', async () => {
            const res = await request(app)
                .post(`/api/users/${userId}/follow`)
                .set('Cookie', [`token=${token}`]);
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('Cannot follow yourself');
        });

        it('should not follow invalid user', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/api/users/${fakeId}/follow`)
                .set('Cookie', [`token=${token}`]);
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('User not found');
        });

        it('should unfollow a user', async () => {
            // Follow first
            await request(app)
                .post(`/api/users/${otherId}/follow`)
                .set('Cookie', [`token=${token}`]);

            const res = await request(app)
                .delete(`/api/users/${otherId}/follow`)
                .set('Cookie', [`token=${token}`]);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Successfully unfollowed user');

            const statusRes = await request(app)
                .get(`/api/users/${otherId}/follow-status`)
                .set('Cookie', [`token=${token}`]);
            expect(statusRes.body.isFollowing).toBe(false);
        });

        it('should not unfollow invalid user', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/users/${fakeId}/follow`)
                .set('Cookie', [`token=${token}`]);
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('User not found');
        });

        it('should get followers list', async () => {
            await request(app)
                .post(`/api/users/${otherId}/follow`)
                .set('Cookie', [`token=${token}`]);

            const res = await request(app).get(`/api/users/${otherId}/followers`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toEqual('Test');
        });

        it('should return 404 if user not found when getFollowers is called', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/users/${fakeId}/followers`);
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('User not found');
        });

        it('should get following list', async () => {
            await request(app)
                .post(`/api/users/${otherId}/follow`)
                .set('Cookie', [`token=${token}`]);

            const res = await request(app).get(`/api/users/${userId}/following`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toEqual('Other');
        });

        it('should return 404 if user not found when getFollowing is called', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/users/${fakeId}/following`);
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('User not found');
        });
    });
});
