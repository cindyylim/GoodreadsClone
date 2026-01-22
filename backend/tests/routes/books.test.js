import request from 'supertest';
import app from '../../src/index.js';
import { Book } from '../../src/models/Book.js';
import * as dbHandler from '../setup.js';
import axios from 'axios';

import { jest } from '@jest/globals';


beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Book Routes', () => {
    const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test Description',
        genres: ['Fiction'],
        publishedYear: 2021,
        averageRating: 0
    };

    describe('GET /api/books', () => {
        it('should get all books with pagination', async () => {
            await Book.create(bookData);
            const res = await request(app).get('/api/books');
            expect(res.statusCode).toEqual(200);
            expect(res.body.books).toHaveLength(1);
            expect(res.body.total).toEqual(1);
            expect(res.body.page).toEqual(1);
            expect(res.body.pages).toEqual(1);
        });
    });

    describe('POST /api/books', () => {
        it('should create a new book', async () => {
            const res = await request(app)
                .post('/api/books')
                .send(bookData);
            expect(res.statusCode).toEqual(201);
            expect(res.body.title).toEqual(bookData.title);
        });
    });

    describe('POST /api/books/import', () => {
        it('should import a book from googleId', async () => {
            const importData = {
                ...bookData,
                googleId: 'google123'
            };
            const res = await request(app)
                .post('/api/books/import')
                .send(importData);
            expect(res.statusCode).toEqual(201);
            expect(res.body.googleId).toEqual('google123');
        });

        it('should import a book from googleId and update missing or zero rating', async () => {
            const importData = {
                ...bookData,
                googleId: 'google123',
                averageRating: 5,
            };
            const res = await request(app)
                .post('/api/books/import')
                .send(importData);
            expect(res.statusCode).toEqual(201);
            expect(res.body.googleId).toEqual('google123');
            expect(res.body.averageRating).toEqual(5);
        });

        it('should return existing book if googleId matches', async () => {
            const existing = await Book.create({ ...bookData, googleId: 'google123' });
            const res = await request(app)
                .post('/api/books/import')
                .send({ ...bookData, googleId: 'google123' });
            expect(res.statusCode).toEqual(200);
            expect(res.body._id).toEqual(existing._id.toString());
        });
    });

    describe('GET /api/books/:id', () => {
        it('should get a book by id', async () => {
            const book = await Book.create(bookData);
            const res = await request(app).get(`/api/books/${book._id}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.title).toEqual(bookData.title);
        });

        it('should return 404 if book not found', async () => {
            const res = await request(app).get('/api/books/664b4c4e2e2e2e2e2e2e2e2e');
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('GET /api/books/search/external', () => {
        it('should search external books from Google Books API', async () => {
            const axiosSpy = jest.spyOn(axios, 'get').mockResolvedValue({
                data: {
                    items: [
                        {
                            id: 'external123',
                            volumeInfo: {
                                title: 'External Book',
                                authors: ['Ext Author'],
                                description: 'Ext Desc',
                                imageLinks: { thumbnail: 'url' },
                                publishedDate: '2020-01-01',
                                averageRating: 4.5
                            }
                        }
                    ]
                }
            });

            const res = await request(app).get('/api/books/search/external?q=test');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].title).toEqual('External Book');

            axiosSpy.mockRestore();
        });

        it('should return 400 if query is missing', async () => {
            const res = await request(app).get('/api/books/search/external');
            expect(res.statusCode).toEqual(400);
        });

        it('should return 500 if Google Books API error', async () => {
            const axiosSpy = jest.spyOn(axios, 'get').mockRejectedValue(new Error('Google Books API error'));

            const res = await request(app).get('/api/books/search/external?q=test');
            expect(res.statusCode).toEqual(500);

            axiosSpy.mockRestore();
        });
    });
});
