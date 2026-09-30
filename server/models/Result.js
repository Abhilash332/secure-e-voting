import mongoose from 'mongoose';

const candidateResultSchema = new mongoose.Schema({
  candidateId: Number,
  name: String,
  party: String,
  votes: Number
});

const resultSchema = new mongoose.Schema({
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true, unique: true },
  title: String,
  region: String,
  totalVotesCounted: Number,
  candidateResults: [candidateResultSchema],
  winner: String,
  publishedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Result', resultSchema);