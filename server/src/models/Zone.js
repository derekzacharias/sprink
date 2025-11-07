import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    zoneNumber: { type: Number, required: true, min: 1, max: 16 },
    name: { type: String, default: function () { return `Zone ${this.zoneNumber}`; } },
    lastUsedAt: { type: Date },
    lastDurationMin: { type: Number },
    status: { type: String, enum: ['on', 'off'], default: 'off' },
    defaultDurationMin: { type: Number, default: 10 }
  },
  { timestamps: true }
);

zoneSchema.index({ userId: 1, zoneNumber: 1 }, { unique: true });

export default mongoose.model('Zone', zoneSchema);

