import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';

export default function Leaderboard() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => setRows(data.leaderboard || []))
      .catch(() => setError('Failed to load leaderboard.'));
  }, []);

  const rankBadge = (i) => {
    if (i === 0) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] text-sm font-bold">1</span>;
    if (i === 1) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#94a3b8]/15 text-[#94a3b8] text-sm font-bold">2</span>;
    if (i === 2) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#cd7f32]/15 text-[#cd7f32] text-sm font-bold">3</span>;
    return <span className="inline-flex items-center justify-center w-7 h-7 text-muted text-sm font-mono">{i + 1}</span>;
  };

  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 relative z-[1]">
        <div className="max-w-[700px] mx-auto mt-16 px-8 animate-cardEntry">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-text tracking-tight mb-1">Leaderboard</h1>
            <p className="text-muted text-sm">Top players ranked by Elo rating</p>
          </div>
          
          <div className="bg-surface/70 backdrop-blur-xl shadow-glass-inset border border-white/5 shadow-2xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[60px_1fr_100px_80px] px-4 py-3 border-b border-border/50 bg-surface2/30 backdrop-blur-sm text-xs font-medium text-muted uppercase tracking-wider">
              <div className="text-center">Rank</div>
              <div>Player</div>
              <div className="text-right">Rating</div>
              <div className="text-right">W / L</div>
            </div>

            {/* Rows */}
            {error && (
              <div className="p-6 text-center text-flame text-sm">{error}</div>
            )}
            {!rows && !error && (
              <div className="p-6 text-center text-muted text-sm flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-border border-t-ember rounded-full animate-spin" />
                Loading...
              </div>
            )}
            {rows && rows.length === 0 && (
              <div className="p-6 text-center text-muted text-sm">No players yet. Be the first to compete!</div>
            )}
            {rows && rows.map((user, i) => (
              <div key={user.id} className={`grid grid-cols-[60px_1fr_100px_80px] px-4 py-3 items-center border-b border-border/50 transition-colors hover:bg-surface2/30 ${i < 3 ? 'bg-surface2/10' : ''}`}>
                <div className="flex justify-center">{rankBadge(i)}</div>
                <div className="font-medium text-sm text-text">{user.username}</div>
                <div className="text-right text-sm font-semibold text-ember font-mono">{user.rating}</div>
                <div className="text-right text-sm text-muted">
                  <span className="text-mint">{user.wins}</span>
                  <span className="mx-1 opacity-40">/</span>
                  <span className="text-flame">{user.losses}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}