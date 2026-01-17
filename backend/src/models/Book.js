import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  coverUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  genres: [{
    type: String,
    trim: true
  }],
  publishedYear: {
    type: Number
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create text index for search
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

// Additional indexes for better query performance
bookSchema.index({ author: 1 }); // For filtering by author
bookSchema.index({ genres: 1 }); // For filtering by genre
bookSchema.index({ averageRating: -1 }); // For sorting by rating (highest first)
bookSchema.index({ publishedYear: -1 }); // For sorting by publication year (newest first)
bookSchema.index({ createdAt: -1 }); // For finding recently added books

export const Book = mongoose.model('Book', bookSchema);