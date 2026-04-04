import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';

export default function Room() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('code');
  const socket = useSocket();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [problemUrl, setProblemUrl] = useState('');
  const [problemSlug, setProblemSlug] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!socket || !roomCode) return;
    const playerName = sessionStorage.getItem('playerName') || 'Player';

    socket.emit('join-room', { code: roomCode, playerName, token });

    const onState = (state) => {
      setPlayers(state.players || []);
      setIsHost(state.isHost);
      setProblemUrl(state.problemUrl);
      setProblemSlug(state.problemSlug || '');
      if (state.started) {
        sessionStorage.setItem('problemSlug', state.problemSlug || '');
        navigate(`/battle?code=${roomCode}`);
      }
    };
    const onUpdated = (list) => setPlayers(list);
    const onStart = (data) => {
      sessionStorage.setItem('problemSlug', data.problemSlug || '');
      navigate(`/battle?code=${roomCode}`);
    };
    const onError = (msg) => setError(msg);

    socket.on('room-state', onState);
    socket.on('players-updated', onUpdated);
    socket.on('battle-start', onStart);
    socket.on('error-msg', onError);

    return () => {
      socket.off('room-state', onState);
      socket.off('players-updated', onUpdated);
      socket.off('battle-start', onStart);
      socket.off('error-msg', onError);
    };
  }, [socket, roomCode, token, navigate]);

  const handleReady = () => { if (socket) socket.emit('player-ready'); };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join#${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8 relative z-[1]">
        <div className="bg-surface border border-border rounded-lg p-8 w-full max-w-[460px] animate-cardEntry text-center">
          <div className="inline-flex items-center gap-2 bg-mint/[0.08] border border-mint/[0.12] rounded-full px-3 py-1 text-xs font-semibold text-mint mb-5 tracking-wide">
            <div className="w-1.5 h-1.5 bg-mint rounded-full animate-blink" />
            Waiting Room
          </div>

          <h1 className="font-display text-lg font-bold tracking-tight text-text mb-1">Battle Lobby</h1>
          <p className="text-muted text-sm mb-5">Share this code with your opponent</p>

          <div className="bg-surface2 border border-border rounded-md p-4 mb-3 cursor-pointer hover:border-ember/30 transition-all" onClick={copyCode}>
            <div className="font-mono text-3xl font-bold tracking-[0.35em] text-ember uppercase">
              {roomCode}
            </div>
            <div className="text-muted text-xs mt-1.5 font-medium">{copied ? '✓ Copied!' : 'Click to copy code'}</div>
          </div>

          <button onClick={copyLink} className="w-full py-2 mb-5 bg-transparent border border-border rounded-md text-muted text-sm font-medium cursor-pointer hover:border-ember/30 hover:text-ember transition-all">
            📎 Copy share link
          </button>

          <div className="text-left mb-5">
            <div className="text-xs font-medium text-muted mb-2.5 uppercase tracking-wider">Players ({players.length}/2)</div>
            {players.map((p) => (
              <div key={p.id} className={`flex items-center justify-between p-3 mb-2 rounded-md border transition-all ${p.ready ? 'bg-mint/[0.04] border-mint/25' : 'bg-surface2 border-border'}`}>
                <span className="font-semibold text-sm text-text">{p.name} {p.isHost && <span className="text-gold text-xs ml-1">★ Host</span>}</span>
                <span className={`text-xs font-semibold uppercase tracking-wide ${p.ready ? 'text-mint' : 'text-muted'}`}>
                  {p.ready ? '✓ Ready' : 'Waiting'}
                </span>
              </div>
            ))}
            {players.length < 2 && (
              <div className="flex items-center justify-center p-3 rounded-md border border-dashed border-border text-muted text-sm">
                <span className="waiting-dots">Waiting for opponent</span>
              </div>
            )}
          </div>

          {error && <div className="bg-flame/[0.08] border border-flame/20 rounded-md text-flame p-2.5 text-sm mb-4 animate-shake">{error}</div>}

          <button onClick={handleReady}
            className="w-full py-3 px-6 bg-ember hover:bg-ember-glow text-white font-semibold rounded-md border-none cursor-pointer shadow-[0_4px_16px_rgba(255,107,53,0.2)] hover:translate-y-[-1px] transition-all duration-200 text-sm">
            ⚔️ Ready Up
          </button>

          <div className="mt-3 text-muted text-xs">
            Battle starts when both players are ready
          </div>
        </div>
      </main>
    </>
  );
}