import { Group } from "../models/Group.js";

export const createGroup = async (req, res) => {
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
};
export const getGroups = async (req, res) => {
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
};

export const getGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'name avatar')
            .populate('createdBy', 'name');
        if (!group) return res.status(404).json({ message: 'Group not found' });
        res.json(group);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const joinGroup = async (req, res) => {
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
};

export const leaveGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        group.members = group.members.filter(id => id.toString() !== req.user.userId);
        await group.save();
        res.json({ message: 'Left group' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};