import 'dotenv/config';
import { User } from '../models/User.js';

export const getPublicUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password -email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user's followers
export const getFollowers = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate('followers', 'name avatar');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.followers || []);
    } catch (error) {
        console.error('Followers error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user's following
export const getFollowing = async (req, res) => {
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
};

// Check if current user is following another user
export const getFollowStatus = async (req, res) => {
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
};

// Follow a user
export const followUser = async (req, res) => {
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
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
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
};