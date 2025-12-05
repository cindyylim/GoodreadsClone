import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  posts: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Indexes for better query performance
topicSchema.index({ group: 1, createdAt: -1 }); // For getting topics in a group by creation date
topicSchema.index({ author: 1 }); // For finding topics created by a user
topicSchema.index({ title: 'text' }); // For text search in topic titles
topicSchema.index({ createdAt: -1 }); // For finding recently created topics

export const Topic = mongoose.model('Topic', topicSchema);