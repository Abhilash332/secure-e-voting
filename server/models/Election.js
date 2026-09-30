import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  party: { type: String, required: true }
});

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  region: { type: String, required: true },
  candidates: [candidateSchema],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
  publicKey: {
    n: { type: String, required: true },
    g: { type: String, required: true }
  },
  privateKey: {
    lambda: { type: String, required: true },
    mu: { type: String, required: true }
  }
}, { timestamps: true });

export default mongoose.model('Election', electionSchema);