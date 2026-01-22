import axios from 'axios';
import { Book } from "../models/Book.js";
export const getBooks = async (req, res) => {
    try {
        let { page = 1, limit = 20 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const skip = (page - 1) * limit;
        const total = await Book.countDocuments();
        const books = await Book.find().skip(skip).limit(limit);
        const pages = Math.ceil(total / limit);

        res.json({
            books,
            total,
            page,
            pages
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createBook = async (req, res) => {
    try {
        const { title, author, coverUrl, description, genres, publishedYear } = req.body;

        const book = new Book({
            title,
            author,
            coverUrl,
            description,
            genres,
            publishedYear
        });

        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const importBook = async (req, res) => {
    try {
        const { googleId, title, author, coverUrl, description, publishedYear } = req.body;

        // Check if book already exists
        let book = await Book.findOne({ googleId });
        if (book) {
            // Update missing or zero rating if new data has it
            if (req.body.averageRating && (!book.averageRating || book.averageRating === 0)) {
                book.averageRating = req.body.averageRating;
                await book.save();
            }
            return res.json(book);
        }

        // Create new book
        book = new Book({
            googleId,
            title,
            author,
            coverUrl,
            description,
            publishedYear,
            averageRating: req.body.averageRating || 0
        });

        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Google Books External Search
export const searchExternalBooks = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Query parameter "q" is required' });
        }

        const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`;
        const response = await axios.get(googleBooksUrl);

        const books = (response.data.items || []).map(item => {
            const volumeInfo = item.volumeInfo || {};
            return {
                _id: item.id, // Use Google ID as temporary ID
                title: volumeInfo.title || 'Unknown Title',
                author: (volumeInfo.authors || []).join(', ') || 'Unknown Author',
                description: volumeInfo.description || '',
                coverUrl: volumeInfo.imageLinks?.thumbnail || '',
                publishedYear: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : null,
                averageRating: volumeInfo.averageRating || 0,
                isExternal: true
            };
        });

        res.json(books);
    } catch (error) {
        console.error('Google Books API error:', error.message);
        res.status(500).json({ message: 'Error fetching from Google Books' });
    }
};