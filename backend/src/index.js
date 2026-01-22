import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { serialize, parse } from "cookie";
import { connectDB } from './db.js';

// Import models
import { registerUser, loginUser, logoutUser, getUserProfile, putUserProfile } from './routes/auth.route.js';
import { getBookshelf, postBookshelf, putBookshelf, deleteBookshelf, getBookshelfByStatus, getBookshelfStats } from './routes/bookshelf.route.js';
import { getFollowers, getFollowing, getFollowStatus, followUser, unfollowUser, getPublicUserProfile } from './routes/community.route.js';
import { getBooks, createBook, importBook, getBook, searchExternalBooks } from './routes/book.route.js';
import { getGroups, createGroup, getGroup, joinGroup, leaveGroup } from './routes/group.route.js';
import { getTopics, createTopic, getTopic, replyTopic } from './routes/topic.route.js';

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'https://goodreads-frontend-rp56.onrender.com'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  let token = null;
  if (req.headers.cookie) {
    const cookies = parse(req.headers.cookie);
    token = cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Basic route
app.get('/', (req, res) => {
  res.send('Goodreads Clone API is running');
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/users/register', registerUser);
app.post('/api/users/login', loginUser);
app.post("/api/users/logout", logoutUser);
app.get('/api/users/profile', authenticateToken, getUserProfile)
app.put('/api/users/profile', authenticateToken, putUserProfile);

// Bookshelf routes 
app.get('/api/users/bookshelf', authenticateToken, getBookshelf);
app.post('/api/users/bookshelf', authenticateToken, postBookshelf);
app.put('/api/users/bookshelf/:id', authenticateToken, putBookshelf);
app.delete('/api/users/bookshelf/:id', authenticateToken, deleteBookshelf);
app.get('/api/users/:id/bookshelf', getBookshelfByStatus);
app.get('/api/users/:id/bookshelf/stats', getBookshelfStats);

// Community routes
app.get('/api/users/:id', getPublicUserProfile);
app.get('/api/users/:id/followers', getFollowers);
app.get('/api/users/:id/following', getFollowing);
app.get('/api/users/:id/follow-status', authenticateToken, getFollowStatus);
app.post('/api/users/:id/follow', authenticateToken, followUser);
app.delete('/api/users/:id/follow', authenticateToken, unfollowUser);

// Book routes
app.get('/api/books', getBooks);
app.post('/api/books', createBook);
app.post('/api/books/import', importBook);
app.get('/api/books/:id', getBook);
app.get('/api/books/search/external', searchExternalBooks);

// Group routes
app.post('/api/groups', authenticateToken, createGroup);
app.get('/api/groups', getGroups);
app.get('/api/groups/:id', getGroup);
app.post('/api/groups/:id/join', authenticateToken, joinGroup);
app.post('/api/groups/:id/leave', authenticateToken, leaveGroup);

// Topic routes
app.get('/api/groups/:id/topics', getTopics);
app.post('/api/groups/:id/topics', authenticateToken, createTopic);
app.get('/api/topics/:id', getTopic);
app.post('/api/topics/:id/reply', authenticateToken, replyTopic);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

export default app;
