import { Book } from '../../src/models/Book.js';
import * as dbHandler from '../setup.js';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Book Model Test', () => {
    it('should create & save book successfully', async () => {
        const bookData = {
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            genres: ['Classic', 'Fiction'],
            publishedYear: 1925
        };
        const validBook = new Book(bookData);
        const savedBook = await validBook.save();

        expect(savedBook._id).toBeDefined();
        expect(savedBook.title).toBe(bookData.title);
        expect(savedBook.author).toBe(bookData.author);
        expect(savedBook.genres).toContain('Classic');
        expect(savedBook.genres).toContain('Fiction');
    });

    it('should fail to create book without required fields', async () => {
        const bookWithoutRequiredField = new Book({ title: 'Test' });
        let err;
        try {
            await bookWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeDefined();
        expect(err.errors.author).toBeDefined();
    });

    it('should save book with googleId successfully', async () => {
        const bookData = {
            title: 'Test Book',
            author: 'Test Author',
            googleId: 'abc123'
        };
        const book = new Book(bookData);
        const savedBook = await book.save();
        expect(savedBook.googleId).toBe('abc123');
    });
});
