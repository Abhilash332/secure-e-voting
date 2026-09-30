import Election from '../models/Election.js';
import Ballot from '../models/Ballot.js';
import User from '../models/User.js';
import crypto from 'crypto';

export const getRegionalElections = async (req, res) => {
  try {
    const voterRegion = req.user.region;
    const now = new Date();

    const elections = await Election.find({
      region: voterRegion,
      status: 'active',
      startTime: { $lte: now },
      endTime: { $gt: now }
    }).select('-privateKey');

    const user = await User.findById(req.user.id);

    const response = elections.map(el => ({
      _id: el._id,
      title: el.title,
      region: el.region,
      candidates: el.candidates,
      publicKey: el.publicKey,
      endTime: el.endTime,
      hasVoted: user.hasVotedElections.includes(el._id)
    }));

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const castVote = async (req, res) => {
  try {
    const { electionId, encryptedVector } = req.body;
    const voterId = req.user.id;

    const election = await Election.findById(electionId);
    if (!election || election.status !== 'active') {
      return res.status(400).json({ message: 'Election is closed or does not exist' });
    }

    if (new Date() > election.endTime) {
      return res.status(400).json({ message: 'Voting window has expired' });
    }

    const voterTokenHash = crypto
      .createHash('sha256')
      .update(`${voterId}_${electionId}_${process.env.JWT_SECRET}`)
      .digest('hex');

    await Ballot.updateMany({ electionId, voterTokenHash }, { isLatest: false });

    await Ballot.create({
      electionId,
      voterTokenHash,
      encryptedVector,
      isLatest: true
    });

    await User.findByIdAndUpdate(voterId, {
      $addToSet: { hasVotedElections: electionId }
    });

    res.json({ message: 'Ballot successfully recorded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};