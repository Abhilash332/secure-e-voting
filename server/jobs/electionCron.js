import cron from 'node-cron';
import Election from '../models/Election.js';
import Ballot from '../models/Ballot.js';
import Result from '../models/Result.js';
import User from '../models/User.js';
import { homomorphicTally, decryptTally } from '../crypto/paillier.js';

const startElectionCron = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const expiredElections = await Election.find({
        status: 'active',
        endTime: { $lte: now }
      });

      for (const election of expiredElections) {
        console.log(`Processing closure for Election: ${election.title} (${election._id})`);

        const validBallots = await Ballot.find({
          electionId: election._id,
          isLatest: true
        });

        const candidateCount = election.candidates.length;
        let candidateVotes = new Array(candidateCount).fill(0);

        if (validBallots.length > 0) {
          const encryptedSums = homomorphicTally(validBallots, election.publicKey, candidateCount);
          candidateVotes = decryptTally(encryptedSums, election.privateKey, election.publicKey);
        }

        const candidateResults = election.candidates.map((cand, index) => ({
          candidateId: cand.id,
          name: cand.name,
          party: cand.party,
          votes: candidateVotes[index] || 0
        }));

        let highestVotes = -1;
        let winner = 'No votes cast / Tie';
        candidateResults.forEach(cand => {
          if (cand.votes > highestVotes) {
            highestVotes = cand.votes;
            winner = `${cand.name} (${cand.party})`;
          }
        });

        await Result.create({
          electionId: election._id,
          title: election.title,
          region: election.region,
          totalVotesCounted: validBallots.length,
          candidateResults,
          winner
        });

        await Ballot.deleteMany({ electionId: election._id });
        console.log(`Ballot records wiped for election: ${election._id}`);

        election.status = 'completed';
        await election.save();

        await User.updateMany(
          { hasVotedElections: election._id },
          { $pull: { hasVotedElections: election._id } }
        );
      }
    } catch (err) {
      console.error('Error during scheduled tally execution:', err);
    }
  });
};

export default startElectionCron;