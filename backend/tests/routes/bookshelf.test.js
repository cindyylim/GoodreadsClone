import request from 'supertest';
import app from '../../src/index.js';
import { Book } from '../../src/models/Book.js';
import { Bookshelf } from '../../src/models/Bookshelf.js';
import * as dbHandler from '../setup.js';
import mongoose from 'mongoose';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Bookshelf Routes', () => {
    let token;
    let userId;
    let bookId;

    beforeEach(async () => {
        const userRes = await request(app).post('/api/users/register').send({
            name: 'Test',
            email: 'test@example.com',
            password: 'password123'
        });
        token = userRes.body.token;
        userId = userRes.body.user._id;

        const book = await Book.create({
            title: 'Test Book',
            author: 'Test Author'
        });
        bookId = book._id;
    });

    describe('POST /api/users/bookshelf', () => {
        it('should add a book to the bookshelf', async () => {
            const res = await request(app)
                .post('/api/users/bookshelf')
                .set('Cookie', [`token=${token}`])
                .send({
                    bookId,
                    status: 'want-to-read'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toEqual('want-to-read');
        });

        it('should not add the same book twice', async () => {
            await request(app)
                .post('/api/users/bookshelf')
                .set('Cookie', [`token=${token}`])
                .send({ bookId, status: 'want-to-read' });

            const res = await request(app)
                .post('/api/users/bookshelf')
                .set('Cookie', [`token=${token}`])
                .send({ bookId, status: 'read' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('You have already added this book to your shelf.');
        });
    });

    describe('GET /api/users/bookshelf', () => {
        it('should get user\'s bookshelf', async () => {
            await Bookshelf.create({ user: userId, book: bookId, status: 'read' });
            const res = await request(app)
                .get('/api/users/bookshelf')
                .set('Cookie', [`token=${token}`]);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].status).toEqual('read');
        });
    });

    describe('PUT /api/users/bookshelf/:id', () => {
        it('should update bookshelf item', async () => {
            const shelfItem = await Bookshelf.create({ user: userId, book: bookId, status: 'want-to-read' });
            const res = await request(app)
                .put(`/api/users/bookshelf/${shelfItem._id}`)
                .set('Cookie', [`token=${token}`])
                .send({ status: 'currently-reading' });
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('currently-reading');
        });

        it('should return 404 if bookshelf item not found', async () => {
            const res = await request(app)
                .put(`/api/users/bookshelf/${new mongoose.Types.ObjectId()}`)
                .set('Cookie', [`token=${token}`])
                .send({ status: 'currently-reading' });
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('DELETE /api/users/bookshelf/:id', () => {
        it('should remove book from bookshelf', async () => {
            const shelfItem = await Bookshelf.create({ user: userId, book: bookId, status: 'read' });
            const res = await request(app)
                .delete(`/api/users/bookshelf/${shelfItem._id}`)
                .set('Cookie', [`token=${token}`]);
            expect(res.statusCode).toEqual(200);
            const remaining = await Bookshelf.findById(shelfItem._id);
            expect(remaining).toBeNull();
        });

        it('should return 404 if bookshelf item not found', async () => {
            const res = await request(app)
                .delete(`/api/users/bookshelf/${new mongoose.Types.ObjectId()}`)
                .set('Cookie', [`token=${token}`]);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('Get bookshelf by status', () => {
        it('should get bookshelf by status', async () => {
            await Bookshelf.create({ user: userId, book: bookId, status: 'read' });
            const res = await request(app).get(`/api/users/${userId}/bookshelf?status=read`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].status).toEqual('read');
        });
    });

    describe('Get bookshelf stats', () => {
        it('should get bookshelf stats', async () => {
            await Bookshelf.create({ user: userId, book: bookId, status: 'read' });
            const res = await request(app).get(`/api/users/${userId}/bookshelf/stats`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.read).toEqual(1);
            expect(res.body['currently-reading']).toEqual(0);
            expect(res.body['want-to-read']).toEqual(0);
        });
    });
});
