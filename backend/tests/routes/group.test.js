import request from 'supertest';
import app from '../../src/index.js';
import { Group } from '../../src/models/Group.js';
import * as dbHandler from '../setup.js';
import mongoose from 'mongoose';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Group routes', () => {
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
    it('should create a new group', async () => {
        const res = await request(app)
            .post('/api/groups')
            .set('Cookie', [`token=${token}`])
            .send({
                name: 'Classic Literature',
                description: 'Discussing the classics',
                tags: ['classics', 'reading']
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.name).toEqual('Classic Literature');
    });

    it('should get all groups', async () => {
        await Group.create({ name: 'Group 1', createdBy: userId });
        const res = await request(app).get('/api/groups');
        expect(res.statusCode).toEqual(200);
        expect(res.body.groups).toHaveLength(1);
    });

    it('should get all groups matching a search query', async () => {
        await Group.create({ name: 'Group 1', createdBy: userId });
        await Group.create({ name: 'Test', createdBy: userId });

        const res = await request(app).get('/api/groups?search=Group');
        expect(res.statusCode).toEqual(200);
        expect(res.body.groups).toHaveLength(1);
    });

    it('should get a group by id', async () => {
        const group = await Group.create({ name: 'Group 1', createdBy: userId });

        const res = await request(app).get(`/api/groups/${group._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Group 1');
    });

    it('should return 404 if group does not exist ', async () => {
        const res = await request(app).get(`/api/groups/${new mongoose.Types.ObjectId()}`);
        expect(res.statusCode).toEqual(404);
    });

    it('should join and leave a group', async () => {
        const group = await Group.create({ name: 'Join Group', createdBy: userId });

        const joinRes = await request(app)
            .post(`/api/groups/${group._id}/join`)
            .set('Cookie', [`token=${token}`]);
        expect(joinRes.statusCode).toEqual(200);

        const updatedGroup = await Group.findById(group._id);
        expect(updatedGroup.members[0].toString()).toEqual(userId);

        const leaveRes = await request(app)
            .post(`/api/groups/${group._id}/leave`)
            .set('Cookie', [`token=${token}`]);
        expect(leaveRes.statusCode).toEqual(200);

        const updatedGroup2 = await Group.findById(group._id);
        expect(updatedGroup2.members).toHaveLength(0);
    });

    it('should return 404 if group does not exist when joining and leaving a group', async () => {
        const joinRes = await request(app)
            .post(`/api/groups/${new mongoose.Types.ObjectId()}/join`)
            .set('Cookie', [`token=${token}`]);
        expect(joinRes.statusCode).toEqual(404);

        const leaveRes = await request(app)
            .post(`/api/groups/${new mongoose.Types.ObjectId()}/leave`)
            .set('Cookie', [`token=${token}`]);
        expect(leaveRes.statusCode).toEqual(404);
    })
});
