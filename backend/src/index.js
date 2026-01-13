import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import crypto from "crypto";
import { serialize, parse } from "cookie";

dotenv.config();
import { connectDB } from './db.js';

// Import models
import { User } from './models/User.js';
import { Book } from "./models/Book.js";
import { Bookshelf } from './models/Bookshelf.js';
import { Group } from './models/Group.js';
import { Topic } from './models/Topic.js';


const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'https://goodreads-frontend-rp56.onrender.com'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate JWT Token
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  res.setHeader('Set-Cookie', serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  }));
  return token;
};

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

// User routes
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate token
    const token = generateToken(res, user._id);
    // Return user data (without password) and token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(res, user._id);
    user.lastLogin = new Date();
    await user.save();
    // Return user data (without password) and token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post("/api/users/logout", async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
})

// Get current user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, avatar, bio } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email, avatar, bio },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get public user profile by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    console.log('User profile request:', { userId, userIdType: typeof userId, userIdLength: userId.length });

    const user = await User.findById(userId).select('-password -email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's bookshelf by status
app.get('/api/users/:id/bookshelf', async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.params.id;

    console.log('Bookshelf request:', { userId, status, userIdType: typeof userId, userIdLength: userId.length });

    // Try to handle the user ID more flexibly
    let query = { user: userId };

    if (status) {
      query.status = status;
    }

    console.log('Query:', query);

    const bookshelf = await Bookshelf.find(query)
      .populate('book')
      .sort({ dateAdded: -1 });

    console.log('Found bookshelf items:', bookshelf.length);

    res.json(bookshelf);
  } catch (error) {
    console.error('Bookshelf error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's bookshelf stats
app.get('/api/users/:id/bookshelf/stats', async (req, res) => {
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
});

// Get user's followers
app.get('/api/users/:id/followers', async (req, res) => {
  try {
    const userId = req.params.id;

    console.log('Followers request:', { userId, userIdType: typeof userId, userIdLength: userId.length });

    const user = await User.findById(userId).populate('followers', 'name avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.followers || []);
  } catch (error) {
    console.error('Followers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's following
app.get('/api/users/:id/following', async (req, res) => {
  try {
    const userId = req.params.id;

    console.log('Following request:', { userId, userIdType: typeof userId, userIdLength: userId.length });

    const user = await User.findById(userId).populate('following', 'name avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.following || []);
  } catch (error) {
    console.error('Following error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if current user is following another user
app.get('/api/users/:id/follow-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    console.log('Follow status request:', { userId, userIdType: typeof userId, userIdLength: userId.length });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = user.followers && user.followers.includes(req.user.userId);
    res.json({ isFollowing });
  } catch (error) {
    console.error('Follow status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Follow a user
app.post('/api/users/:id/follow', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    console.log('Follow request:', { userId, userIdType: typeof userId, userIdLength: userId.length });

    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user.userId);

    // Add to following list
    if (!currentUser.following.includes(userId)) {
      currentUser.following.push(userId);
      await currentUser.save();
    }

    // Add to followers list
    if (!userToFollow.followers.includes(req.user.userId)) {
      userToFollow.followers.push(req.user.userId);
      await userToFollow.save();
    }

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unfollow a user
app.delete('/api/users/:id/follow', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    console.log('Unfollow request:', { userId, userIdType: typeof userId, userIdLength: userId.length });

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user.userId);

    // Remove from following list
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    await currentUser.save();

    // Remove from followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.userId);
    await userToUnfollow.save();

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Book routes
app.get('/api/books', async (req, res) => {
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
});

app.post('/api/books', async (req, res) => {
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
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bookshelf routes
app.get('/api/users/bookshelf', authenticateToken, async (req, res) => {
  try {
    const bookshelf = await Bookshelf.find({ user: req.user.userId })
      .populate('book')
      .sort({ dateAdded: -1 });
    res.json(bookshelf);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/users/bookshelf', authenticateToken, async (req, res) => {
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
    console.error('Bookshelf POST error:', error);
    console.error('Request body:', req.body);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update bookshelf item
app.put('/api/users/bookshelf/:id', authenticateToken, async (req, res) => {
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
});

// Delete bookshelf item
app.delete('/api/users/bookshelf/:id', authenticateToken, async (req, res) => {
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
});

// Group routes
app.post('/api/groups', authenticateToken, async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const group = new Group({
      name,
      description,
      tags,
      members: [req.user.userId],
      createdBy: req.user.userId
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/groups', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      };
    }

    const total = await Group.countDocuments(query);
    const groups = await Group.find(query)
      .populate('members', 'name avatar')
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      groups,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/groups/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name avatar')
      .populate('createdBy', 'name');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/groups/:id/join', authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.includes(req.user.userId)) {
      group.members.push(req.user.userId);
      await group.save();
    }
    res.json({ message: 'Joined group' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/groups/:id/leave', authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    group.members = group.members.filter(id => id.toString() !== req.user.userId);
    await group.save();
    res.json({ message: 'Left group' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Topic routes
app.get('/api/groups/:id/topics', async (req, res) => {
  try {
    const topics = await Topic.find({ group: req.params.id })
      .populate('author', 'name')
      .populate('posts.author', 'name')
      .sort({ createdAt: -1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/groups/:id/topics', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const topic = new Topic({
      group: req.params.id,
      title,
      author: req.user.userId,
      posts: [{ author: req.user.userId, content }]
    });
    await topic.save();
    const populatedTopic = await Topic.findById(topic._id)
      .populate('author', 'name')
      .populate('posts.author', 'name');
    res.status(201).json(populatedTopic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/topics/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('author', 'name')
      .populate('posts.author', 'name')
      .populate('group', 'name');
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/topics/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    topic.posts.push({
      author: req.user.userId,
      content
    });
    await topic.save();

    const populatedTopic = await Topic.findById(topic._id)
      .populate('author', 'name')
      .populate('posts.author', 'name');
    res.json(populatedTopic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
