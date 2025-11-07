import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    type: { type: String, enum: ['info', 'warning', 'error'], default: 'info' },
    title: { type: String },
    body: { type: String },
    channel: { type: String, enum: ['in-app', 'sms', 'push'], default: 'in-app' },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);

