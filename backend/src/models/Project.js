import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#6366f1' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
  }],
  columns: {
    type: [String],
    default: ['To Do', 'In Progress', 'In Review', 'Done'],
  },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
