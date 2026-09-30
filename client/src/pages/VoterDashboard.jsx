import React, { useEffect, useState } from 'react';
import { getRegionalElections, castVote } from '../services/api';
import { encryptVoteVector } from '../crypto/paillierClient';

const VoterDashboard = () => {
  const [elections, setElections] = useState([]);
  const [revoteMode, setRevoteMode] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchElections = async () => {
    try {
      const { data } = await getRegionalElections();
      setElections(data);
    } catch (err) {
      alert('Failed to load elections');
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleVoteSubmit = async (election) => {
    const candidateIdx = selectedCandidate[election._id];
    if (candidateIdx === undefined) return alert('Select a candidate first');

    setLoading(true);
    try {
      // Homomorphic client-side one-hot vector encryption
      const encryptedVector = encryptVoteVector(
        Number(candidateIdx),
        election.candidates.length,
        election.publicKey
      );

      await castVote({ electionId: election._id, encryptedVector });
      alert('Ballot encrypted and cast successfully');
      setRevoteMode({ ...revoteMode, [election._id]: false });
      fetchElections();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Voter Constituency Portal</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {elections.map((election) => {
          const alreadyVoted = election.hasVoted && !revoteMode[election._id];

          return (
            <div key={election._id} className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{election.title}</h2>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded">Region: {election.region}</span>
              </div>

              {alreadyVoted ? (
                <div className="space-y-4">
                  {/* Coercion-resistant state: shows status without disclosing past selection */}
                  <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-300 p-4 rounded text-center font-medium">
                    ✓ You have voted in this election
                  </div>
                  <button
                    onClick={() => setRevoteMode({ ...revoteMode, [election._id]: true })}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 rounded font-semibold transition"
                  >
                    Revote
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">Select a candidate:</p>
                  {election.candidates.map((cand) => (
                    <label
                      key={cand.id}
                      className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded cursor-pointer hover:bg-slate-700 border border-slate-600"
                    >
                      <input
                        type="radio"
                        name={`cand-${election._id}`}
                        value={cand.id}
                        onChange={() => setSelectedCandidate({ ...selectedCandidate, [election._id]: cand.id })}
                      />
                      <span>
                        {cand.name} <span className="text-slate-400">({cand.party})</span>
                      </span>
                    </label>
                  ))}
                  <button
                    disabled={loading}
                    onClick={() => handleVoteSubmit(election)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition disabled:opacity-50"
                  >
                    {loading ? 'Encrypting with Paillier...' : 'Cast Encrypted Vote'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VoterDashboard;