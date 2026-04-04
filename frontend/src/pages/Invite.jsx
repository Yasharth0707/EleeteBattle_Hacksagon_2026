import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';

export default function Invite() {
  const [problemUrl, setProblemUrl] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
      sessionStorage.setItem('playerName', playerName || 'Player 1');
      sessionStorage.setItem('isHost', 'true');
      sessionStorage.setItem('problemUrl', problemUrl);
      if (data.slug) sessionStorage.setItem('problemSlug', data.slug);
      navigate(`/room?code=${data.code}`);
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8 relative z-[1]">
        <div className="bg-surface/70 backdrop-blur-xl shadow-glass-inset border border-white/5 shadow-2xl rounded-lg p-8 w-full max-w-[460px] animate-cardEntry">
          <div className="inline-flex items-center gap-2 bg-ember/[0.08] border border-ember/[0.12] rounded-full px-3 py-1 text-xs font-semibold text-ember mb-5 tracking-wide">
            <div className="w-1.5 h-1.5 bg-mint rounded-full animate-blink" />
            Private Battle
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight text-text mb-1.5">Challenge a Friend</h1>
          <p className="text-muted text-sm mb-7 leading-relaxed">
            Paste a LeetCode problem URL, create a room, and share the code with your opponent.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-medium text-text2 mb-1.5">Problem URL</label>
              <input type="url" value={problemUrl} onChange={e => setProblemUrl(e.target.value)} placeholder="https://leetcode.com/problems/two-sum/" required
                className="w-full bg-surface/50 border border-border rounded-md text-text text-sm p-2.5 transition-all duration-200 outline-none focus:border-ember/50 focus:ring-2 focus:ring-ember/20 focus:bg-surface2 placeholder:text-muted" />
            </div>
            <div className="mb-5">
              <label className="block text-xs font-medium text-text2 mb-1.5">
                Display Name <span className="text-muted font-normal">(optional)</span>
              </label>
              <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Your nickname" maxLength={20}
                className="w-full bg-surface/50 border border-border rounded-md text-text text-sm p-2.5 transition-all duration-200 outline-none focus:border-ember/50 focus:ring-2 focus:ring-ember/20 focus:bg-surface2 placeholder:text-muted" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-6 bg-ember hover:bg-ember-glow text-white font-semibold rounded-md border-none cursor-pointer shadow-glow-ember hover:shadow-[0_6px_24px_rgba(255,107,53,0.5)] transition-all duration-300 hover:translate-y-[-1px] disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 text-sm">
              {loading ? <><span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2 align-middle" /> Creating room...</> : 'Create Battle Room'}
            </button>
            {error && <div className="bg-flame/[0.08] border border-flame/20 rounded-md text-flame p-2.5 text-sm mt-3 font-medium animate-shake">{error}</div>}
          </form>

          <div className="flex items-center gap-4 my-6 text-muted text-xs font-medium tracking-wider">
            <div className="flex-1 h-px bg-border" />OR<div className="flex-1 h-px bg-border" />
          </div>

          <button onClick={() => navigate('/join')}
            className="w-full py-2.5 px-6 bg-transparent text-text2 border border-border rounded-md cursor-pointer font-medium transition-all duration-200 hover:border-ember/30 hover:text-ember hover:bg-ember/[0.04] text-sm">
            Join with Room Code
          </button>

          <div className="flex gap-2 mt-5">
            {['📝 Any Problem', '⚡ Real-Time', '🏆 First Wins'].map(f => (
              <div className="flex-1 bg-surface2 border border-border rounded-md p-2 text-center text-xs text-muted font-medium" key={f}>
                {f}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}