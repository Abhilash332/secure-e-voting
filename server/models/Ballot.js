import mongoose from 'mongoose';

const ballotSchema = new mongoose.Schema({
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  voterTokenHash: { type: String, required: true, index: true },
  encryptedVector: [{ type: String, required: true }],
  isLatest: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Ballot', ballotSchema);