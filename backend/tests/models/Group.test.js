import mongoose from 'mongoose';
import { Group } from '../../src/models/Group.js';
import * as dbHandler from '../setup.js';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Group Model Test', () => {
    it('should create & save group successfully', async () => {
        const groupData = {
            name: 'Group 1',
            description: 'Description',
            tags: ['tag1', 'tag2'],
            createdBy: new mongoose.Types.ObjectId(),
            members: [new mongoose.Types.ObjectId()]
        };
        const validGroup = new Group(groupData);
        const savedGroup = await validGroup.save();

        expect(savedGroup._id).toBeDefined();
        expect(savedGroup.name).toBe(groupData.name);
        expect(savedGroup.tags).toHaveLength(2);
    });

    it('should fail to create group without required fields', async () => {
        const groupWithoutRequiredField = new Group({ description: 'Test' });
        let err;
        try {
            await groupWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeDefined();
        expect(err.errors.name).toBeDefined();
    });
});
