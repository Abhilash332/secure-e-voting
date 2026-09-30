import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['commission', 'voter'], default: 'voter' },
  region: { type: String, required: true },
  hasVotedElections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Election' }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);