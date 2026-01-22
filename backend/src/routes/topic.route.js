import { Topic } from "../models/Topic.js";

export const getTopics = async (req, res) => {
    try {
        const topics = await Topic.find({ group: req.params.id })
            .populate('author', 'name')
            .populate('posts.author', 'name')
            .sort({ createdAt: -1 });
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createTopic = async (req, res) => {
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
};

export const getTopic = async (req, res) => {
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
};

export const replyTopic = async (req, res) => {
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
};