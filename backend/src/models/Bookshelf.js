import mongoose from 'mongoose';

const bookshelfSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  status: {
    type: String,
    enum: ['read', 'currently-reading', 'want-to-read'],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  dateRead: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure unique user-book combinations
bookshelfSchema.index({ user: 1, book: 1 }, { unique: true });

// Additional indexes for better query performance
bookshelfSchema.index({ user: 1, status: 1 }); // For getting user's books by status
bookshelfSchema.index({ user: 1, dateAdded: -1 }); // For getting user's recently added books
bookshelfSchema.index({ user: 1, rating: -1 }); // For getting user's highly rated books
bookshelfSchema.index({ book: 1 }); // For finding all users who have a specific book
bookshelfSchema.index({ status: 1 }); // For filtering by status across all users

export const Bookshelf = mongoose.model('Bookshelf', bookshelfSchema);