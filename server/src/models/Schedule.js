import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    zoneNumber: { type: Number, required: true, min: 1, max: 16 },
    name: { type: String, default: 'Schedule' },
    // cron-like schedule or structured plan
    daysOfWeek: [{ type: Number }], // 0-6
    startTime: { type: String }, // HH:MM
    durationMin: { type: Number, default: 10 },
    enabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

scheduleSchema.index({ userId: 1, zoneNumber: 1 });

export default mongoose.model('Schedule', scheduleSchema);

