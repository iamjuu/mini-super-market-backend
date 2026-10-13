import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  action: { type: String, required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actorName: { type: String, default: 'System' },
  actorRole: { type: String, default: 'SYSTEM' },
  resourceType: { type: String, default: 'Platform' },
  resourceId: { type: String, default: '' },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '127.0.0.1' },
}, { timestamps: true });

export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
export default ActivityLog;
