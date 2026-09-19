import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    phone: { type: String },
    providers: {
      googleId: { type: String },
      githubId: { type: String }
    },
    settings: {
      weather: {
        cityId: { type: String },
        lat: { type: Number },
        lon: { type: Number },
        zip: { type: String },
        country: { type: String, default: 'US' }
      },
      smartMode: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
