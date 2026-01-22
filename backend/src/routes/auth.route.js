import 'dotenv/config';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

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

export const registerUser = async (req, res) => {
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
}

export const loginUser = async (req, res) => {
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
}

export const logoutUser = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
}

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user profile
export const putUserProfile = async (req, res) => {
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
}