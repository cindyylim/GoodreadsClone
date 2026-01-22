import mongoose from 'mongoose';
import { Topic } from '../../src/models/Topic.js';
import * as dbHandler from '../setup.js';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Topic Model Test', () => {
    it('should create & save topic successfully', async () => {
        const topicData = {
            group: new mongoose.Types.ObjectId(),
            title: 'First Topic',
            author: new mongoose.Types.ObjectId(),
            posts: [{
                author: new mongoose.Types.ObjectId(),
                content: 'Hello world'
            }]
        };
        const validTopic = new Topic(topicData);
        const savedTopic = await validTopic.save();

        expect(savedTopic._id).toBeDefined();
        expect(savedTopic.title).toBe(topicData.title);
        expect(savedTopic.posts).toHaveLength(1);
        expect(savedTopic.posts[0].content).toBe('Hello world');
    });

    it('should fail to create topic without required fields', async () => {
        const topicWithoutRequiredField = new Topic({ title: 'Test' });
        let err;
        try {
            await topicWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeDefined();
        expect(err.errors.group).toBeDefined();
        expect(err.errors.author).toBeDefined();
    });
});
