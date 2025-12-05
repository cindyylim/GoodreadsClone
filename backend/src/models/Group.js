import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  tags: [String],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes for better query performance
groupSchema.index({ name: 1 }); // For searching groups by name
groupSchema.index({ tags: 1 }); // For filtering groups by tags
groupSchema.index({ createdBy: 1 }); // For finding groups created by a user
groupSchema.index({ members: 1 }); // For finding groups a user belongs to
groupSchema.index({ createdAt: -1 }); // For finding recently created groups
groupSchema.index({ name: 'text', description: 'text' }); // For text search in groups

export const Group = mongoose.model('Group', groupSchema);