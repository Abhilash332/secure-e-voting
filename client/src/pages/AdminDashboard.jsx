import React, { useState, useEffect } from 'react';
import { createElection, getResults } from '../services/api';

const AdminDashboard = () => {
  const [results, setResults] = useState([]);
  const [title, setTitle] = useState('');
  const [region, setRegion] = useState('North');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [candidates, setCandidates] = useState([
    { name: '', party: '' },
    { name: '', party: '' }
  ]);

  const loadResults = async () => {
    try {
      const { data } = await getResults();
      setResults(data);
    } catch (err) {
      alert('Failed to load election results');
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleAddCandidate = () => {
    setCandidates([...candidates, { name: '', party: '' }]);
  };

  const handleCandidateChange = (index, field, value) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      await createElection({ title, region, candidates, startTime, endTime });
      alert('Election created and keys generated successfully!');
      setTitle('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create election');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Election Commission Panel</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upload/Create System */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Deploy Regional Election</h2>
          <form onSubmit={handleCreateElection} className="space-y-4">
            <input
              type="text"
              placeholder="Election Title"
              className="w-full p-2 rounded bg-slate-700 border border-slate-600"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Constituency Region"
              className="w-full p-2 rounded bg-slate-700 border border-slate-600"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Start Time</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-xs"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">End Time</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-xs"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Participating Parties & Candidates</label>
              {candidates.map((cand, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Candidate Name"
                    className="flex-1 p-2 rounded bg-slate-700 border border-slate-600"
                    value={cand.name}
                    onChange={(e) => handleCandidateChange(idx, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Party"
                    className="flex-1 p-2 rounded bg-slate-700 border border-slate-600"
                    value={cand.party}
                    onChange={(e) => handleCandidateChange(idx, 'party', e.target.value)}
                    required
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddCandidate}
                className="text-xs text-blue-400 hover:underline"
              >
                + Add Candidate
              </button>
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition">
              Publish Election
            </button>
          </form>
        </div>

        {/* Read-Only Certified Results */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Immutable Final Results</h2>
            <button onClick={loadResults} className="text-xs bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">
              Refresh
            </button>
          </div>
          {results.length === 0 ? (
            <p className="text-slate-400 text-sm">No elections have concluded yet.</p>
          ) : (
            <div className="space-y-6">
              {results.map((res) => (
                <div key={res._id} className="p-4 bg-slate-700/50 rounded border border-slate-600">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">{res.title}</h3>
                    <span className="text-xs bg-blue-900/60 border border-blue-400 text-blue-300 px-2 py-0.5 rounded">
                      {res.region}
                    </span>
                  </div>
                  <div className="bg-amber-950/40 border border-amber-600 text-amber-300 p-2 rounded mb-3 text-sm font-medium">
                    Declared Winner: {res.winner}
                  </div>
                  <div className="space-y-1 text-sm">
                    {res.candidateResults.map((c) => (
                      <div key={c.candidateId} className="flex justify-between border-b border-slate-600 py-1">
                        <span>{c.name} ({c.party})</span>
                        <span className="font-semibold text-blue-300">{c.votes} votes</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-slate-400 flex justify-between">
                    <span>Total Ballots Decrypted: {res.totalVotesCounted}</span>
                    <span>Wiped & Finalized: {new Date(res.publishedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;