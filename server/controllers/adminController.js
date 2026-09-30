import Election from '../models/Election.js';
import Result from '../models/Result.js';
import { generateElectionKeys } from '../crypto/paillier.js';

export const createElection = async (req, res) => {
  try {
    const { title, region, candidates, startTime, endTime } = req.body;

    const { publicKey, privateKey } = await generateElectionKeys();

    const indexedCandidates = candidates.map((cand, idx) => ({
      id: idx,
      name: cand.name,
      party: cand.party
    }));

    const election = await Election.create({
      title,
      region,
      candidates: indexedCandidates,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'active',
      publicKey,
      privateKey
    });

    res.status(201).json({
      message: 'Election published successfully',
      electionId: election._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getElectionResults = async (req, res) => {
  try {
    const results = await Result.find().sort({ publishedAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};