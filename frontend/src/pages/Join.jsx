import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';

export default function Join() {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) setRoomCode(location.hash.substring(1).toUpperCase());
  }, [location.hash]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const code = roomCode.trim().toUpperCase();
    if (code.length !== 6) { setError('Room code must be exactly 6 characters.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not join room.'); return; }
      sessionStorage.setItem('playerName', playerName || 'Player 2');
      sessionStorage.setItem('isHost', 'false');
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
          <h1 className="font-display text-xl font-bold tracking-tight text-text mb-1.5">Join a Battle</h1>
          <p className="text-muted text-sm mb-7 leading-relaxed">Enter the 6-character room code shared by your opponent.</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-medium text-text2 mb-1.5">Room Code</label>
              <input type="text" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} placeholder="AB12CD" maxLength={6} required
                className="w-full bg-surface/50 border border-border rounded-md text-text text-2xl font-display font-bold p-3 text-center tracking-[0.3em] uppercase transition-all duration-200 outline-none focus:border-ember/50 focus:ring-2 focus:ring-ember/20 focus:bg-surface2 placeholder:text-muted/50" />
            </div>
            <div className="mb-5">
              <label className="block text-xs font-medium text-text2 mb-1.5">
                Display Name <span className="text-muted font-normal">(optional)</span>
              </label>
              <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Your nickname" maxLength={20}
                className="w-full bg-surface/50 border border-border rounded-md text-text text-sm p-2.5 transition-all duration-200 outline-none focus:border-ember/50 focus:ring-2 focus:ring-ember/20 focus:bg-surface2 placeholder:text-muted" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-6 bg-ember hover:bg-ember-glow text-white font-semibold rounded-md border-none cursor-pointer shadow-glow-ember transition-all duration-300 hover:translate-y-[-1px] disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_4px_24px_rgba(255,107,53,0.5)] text-sm">
              {loading ? 'Joining...' : 'Join Room'}
            </button>
            {error && <div className="bg-flame/[0.08] border border-flame/20 rounded-md text-flame p-2.5 text-sm mt-3 font-medium animate-shake">{error}</div>}
          </form>

          <div className="flex items-center gap-4 my-6 text-muted text-xs font-medium tracking-wider">
            <div className="flex-1 h-px bg-border" />OR<div className="flex-1 h-px bg-border" />
          </div>

          <button onClick={() => navigate('/')}
            className="w-full py-2.5 px-6 bg-transparent text-text2 border border-border rounded-md cursor-pointer font-medium transition-all duration-200 hover:border-ember/30 hover:text-ember hover:bg-ember/[0.04] text-sm">
            ← Back to Home
          </button>
        </div>
      </main>
    </>
  );
}