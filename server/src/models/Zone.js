import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    zoneNumber: { type: Number, required: true, min: 1, max: 16 },
    name: {
      type: String,
      // Mongoose also evaluates this default when preparing $setOnInsert for an
      // upsert, and passes a null context in that case. Reading this.zoneNumber
      // unguarded threw "Cannot read properties of null", which made every
      // POST /api/zones/:n/on fail with a 500.
      default: function () {
        const n = this?.zoneNumber;
        return n == null ? 'Zone' : `Zone ${n}`;
      }
    },
    lastUsedAt: { type: Date },
    lastDurationMin: { type: Number },
    status: { type: String, enum: ['on', 'off'], default: 'off' },
    defaultDurationMin: { type: Number, default: 10 }
  },
  { timestamps: true }
);

zoneSchema.index({ userId: 1, zoneNumber: 1 }, { unique: true });

export default mongoose.model('Zone', zoneSchema);

