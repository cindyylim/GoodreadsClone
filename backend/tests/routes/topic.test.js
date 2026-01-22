import request from 'supertest';
import app from '../../src/index.js';
import { Group } from '../../src/models/Group.js';
import { Topic } from '../../src/models/Topic.js';
import * as dbHandler from '../setup.js';
import mongoose from 'mongoose';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe("Topic routes", () => {
    let token;
    let userId;
    let groupId;

    beforeEach(async () => {
        const userRes = await request(app).post('/api/users/register').send({
            name: 'Test',
            email: 'test@example.com',
            password: 'password123'
        });
        token = userRes.body.token;
        userId = userRes.body.user._id;
        const group = await Group.create({ name: 'Topic Group', createdBy: userId });
        groupId = group._id;
    });

    it('should create a new topic in a group', async () => {
        const res = await request(app)
            .post(`/api/groups/${groupId}/topics`)
            .set('Cookie', [`token=${token}`])
            .send({
                title: 'Favorite Classic?',
                content: 'Discuss your favorite classic book here.'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toEqual('Favorite Classic?');
    });

    it('should get topics for a group', async () => {
        await Topic.create({
            group: groupId,
            title: 'Test Topic',
            author: userId,
            posts: [{ author: userId, content: 'Test content' }]
        });
        const res = await request(app).get(`/api/groups/${groupId}/topics`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(1);
    });

    it('should get topic by id for a group', async () => {
        const topic = await Topic.create({
            group: groupId,
            title: 'Test Topic',
            author: userId,
            posts: [{ author: userId, content: 'Test content' }]
        });
        const res = await request(app).get(`/api/topics/${topic._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual('Test Topic');
    });

    it('should return 404 if topic not found', async () => {
        const res = await request(app).get(`/api/topics/${new mongoose.Types.ObjectId()}`);
        expect(res.statusCode).toEqual(404);
    });

    it('should reply to a topic', async () => {
        const topic = await Topic.create({
            group: groupId,
            title: 'Reply Topic',
            author: userId,
            posts: [{ author: userId, content: 'Original content' }]
        });

        const res = await request(app)
            .post(`/api/topics/${topic._id}/reply`)
            .set('Cookie', [`token=${token}`])
            .send({ content: 'My reply' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.posts).toHaveLength(2);
        expect(res.body.posts[1].content).toEqual('My reply');
    });

    it('should return 404 if topic not found when replying', async () => {
        const res = await request(app)
            .post(`/api/topics/${new mongoose.Types.ObjectId()}/reply`)
            .set('Cookie', [`token=${token}`])
            .send({ content: 'My reply' });

        expect(res.statusCode).toEqual(404);
    });
});
