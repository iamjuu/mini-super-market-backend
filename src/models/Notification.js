import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  targetAudience: {
    type: String,
    enum: ['ALL', 'CUSTOMERS', 'MERCHANTS', 'DELIVERY_PARTNERS'],
    default: 'ALL',
  },
  type: {
    type: String,
    enum: ['ANNOUNCEMENT', 'ALERT', 'PROMOTION', 'SYSTEM'],
    default: 'ANNOUNCEMENT',
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  },
  channels: [{ type: String, default: 'IN_APP' }],
  totalRecipients: { type: Number, default: 5000 },
}, { timestamps: true });

export const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
