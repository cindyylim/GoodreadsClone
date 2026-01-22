import mongoose from 'mongoose';
import 'dotenv/config';
import { Bookshelf } from "../models/Bookshelf.js";
export const getBookshelf = async (req, res) => {
    try {
        const bookshelf = await Bookshelf.find({ user: req.user.userId })
            .populate('book')
            .sort({ dateAdded: -1 });
        res.json(bookshelf);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const postBookshelf = async (req, res) => {
    try {
        const { bookId, status, rating, review } = req.body;
        const bookshelf = new Bookshelf({
            user: req.user.userId,
            book: bookId,
            status,
            rating,
            review
        });
        await bookshelf.save();
        res.status(201).json(bookshelf);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already added this book to your shelf.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update bookshelf item
export const putBookshelf = async (req, res) => {
    try {
        const { status, rating, review } = req.body;
        const bookshelfId = req.params.id;

        const bookshelf = await Bookshelf.findOneAndUpdate(
            { _id: bookshelfId, user: req.user.userId },
            { status, rating, review },
            { new: true }
        );

        if (!bookshelf) {
            return res.status(404).json({ message: 'Bookshelf item not found' });
        }

        res.json(bookshelf);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete bookshelf item
export const deleteBookshelf = async (req, res) => {
    try {
        const bookshelfId = req.params.id;

        const bookshelf = await Bookshelf.findOneAndDelete({
            _id: bookshelfId,
            user: req.user.userId
        });

        if (!bookshelf) {
            return res.status(404).json({ message: 'Bookshelf item not found' });
        }

        res.json({ message: 'Book removed from shelf' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user's bookshelf by status
export const getBookshelfByStatus = async (req, res) => {
    try {
        const { status } = req.query;
        const userId = req.params.id;

        let query = { user: userId };

        if (status) {
            query.status = status;
        }

        const bookshelf = await Bookshelf.find(query)
            .populate('book')
            .sort({ dateAdded: -1 });

        console.log('Found bookshelf items:', bookshelf.length);

        res.json(bookshelf);
    } catch (error) {
        console.error('Bookshelf error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user's bookshelf stats
export const getBookshelfStats = async (req, res) => {
    try {
        const userId = req.params.id;

        console.log('Bookshelf stats request:', { userId, userIdType: typeof userId, userIdLength: userId.length });

        const stats = await Bookshelf.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        console.log('Stats result:', stats);

        const result = {
            'want-to-read': 0,
            'currently-reading': 0,
            'read': 0
        };

        stats.forEach(stat => {
            result[stat._id] = stat.count;
        });

        res.json(result);
    } catch (error) {
        console.error('Bookshelf stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};