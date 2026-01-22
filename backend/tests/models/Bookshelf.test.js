import mongoose from 'mongoose';
import { Bookshelf } from '../../src/models/Bookshelf.js';
import * as dbHandler from '../setup.js';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Bookshelf Model Test', () => {
    it('should create & save bookshelf item successfully', async () => {
        const bookshelfData = {
            user: new mongoose.Types.ObjectId(),
            book: new mongoose.Types.ObjectId(),
            status: 'want-to-read',
            rating: 5,
            review: 'Great book!'
        };
        const validBookshelf = new Bookshelf(bookshelfData);
        const savedBookshelf = await validBookshelf.save();

        expect(savedBookshelf._id).toBeDefined();
        expect(savedBookshelf.status).toBe(bookshelfData.status);
        expect(savedBookshelf.rating).toBe(bookshelfData.rating);
    });

    it('should fail to create bookshelf item without required fields', async () => {
        const bookshelfWithoutRequiredField = new Bookshelf({ status: 'read' });
        let err;
        try {
            await bookshelfWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeDefined();
        expect(err.errors.user).toBeDefined();
        expect(err.errors.book).toBeDefined();
    });

    it('should fail with invalid status enum', async () => {
        const invalidBookshelf = new Bookshelf({
            user: new mongoose.Types.ObjectId(),
            book: new mongoose.Types.ObjectId(),
            status: 'invalid-status'
        });
        let err;
        try {
            await invalidBookshelf.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeDefined();
        expect(err.errors.status).toBeDefined();
    });
});
