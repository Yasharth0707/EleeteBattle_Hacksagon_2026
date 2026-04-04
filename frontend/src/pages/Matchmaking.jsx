import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';

export default function Matchmaking() {
  const socket = useSocket();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [questionType, setQuestionType] = useState('random');
  const [difficulty, setDifficulty] = useState('easy');
  const [problemUrl, setProblemUrl] = useState('');
  const [searching, setSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const onMatch = (data) => {
      setSearching(false);
      clearInterval(timerRef.current);
      setMatchFound(data);
      
      // Store info locally before navigating to the room/battle
      sessionStorage.setItem('playerName', data.opponentName ? 'You' : 'Player');
      sessionStorage.setItem('problemSlug', data.problemSlug || '');

      // Wait 2.5s for the "Match Found!" animation to play, then route
      setTimeout(() => {
        navigate(`/room?code=${data.roomCode}`);
      }, 2500);
    };

    socket.on('match-found', onMatch);
    return () => { socket.off('match-found', onMatch); };
  }, [socket, navigate]);

  const startSearch = () => {
    if (!socket) return;
    setSearching(true);
    setTimer(0);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);

    const payload = {
      playerName: 'Player',
      questionType,
      difficulty: questionType === 'random' ? difficulty : undefined,
      problemUrl: questionType === 'manual' ? problemUrl : undefined,
      token,
    };
    socket.emit('join-queue', payload);
  };

  const cancelSearch = () => {
    if (socket) socket.emit('leave-queue');
    setSearching(false);
    clearInterval(timerRef.current);
    setTimer(0);
  };

  const formatTimer = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8 relative z-[1]">
        <div className="bg-surface border border-border rounded-lg p-8 w-full max-w-[460px] animate-cardEntry">
          
          {/* Match Found Animation */}
          {matchFound && (
            <div className="flex flex-col items-center gap-5 py-6 animate-popIn">
              <div className="font-display text-lg font-bold text-mint uppercase tracking-wide">
                ⚔️ Match Found!
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-ember/10 border-2 border-ember flex items-center justify-center text-lg mb-2">⚡</div>
                  <div className="text-sm font-semibold text-text">You</div>
                </div>
                <div className="font-display text-xl font-bold text-gold">VS</div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-violet/10 border-2 border-violet flex items-center justify-center text-lg mb-2">🎯</div>
                  <div className="text-sm font-semibold text-text">{matchFound.opponentName}</div>
                </div>
              </div>
              <div className="text-muted text-sm">Preparing battle arena...</div>
            </div>
          )}

          {/* Searching Animation (Pulsing Rings) */}
          {searching && !matchFound && (
            <div className="flex flex-col items-center gap-5 py-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-ember/20 rounded-full animate-ringPulse" />
                <div className="absolute inset-[15%] border-2 border-ember/20 rounded-full animate-ringPulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute inset-[30%] border-2 border-ember/20 rounded-full animate-ringPulse" style={{ animationDelay: '1s' }} />
                <div className="w-4 h-4 bg-ember rounded-full shadow-[0_0_16px_rgba(255,107,53,0.4)]" />
              </div>
              <div className="font-display text-sm font-semibold text-text tracking-wide">
                Searching for opponent...
              </div>
              <div className="font-mono text-sm text-muted">{formatTimer(timer)}</div>
              <button onClick={cancelSearch} className="bg-transparent border border-border rounded-md text-muted py-2 px-5 text-sm font-medium cursor-pointer transition-all hover:border-flame/30 hover:text-flame hover:bg-flame/[0.04]">
                Cancel
              </button>
            </div>
          )}

          {/* Setup Form */}
          {!searching && !matchFound && (
            <>
              <div className="inline-flex items-center gap-2 bg-violet/[0.08] border border-violet/[0.12] rounded-full px-3 py-1 text-xs font-semibold text-violet mb-5 tracking-wide">
                <div className="w-1.5 h-1.5 bg-mint rounded-full animate-blink" />
                Matchmaking
              </div>
              <h1 className="font-display text-xl font-bold tracking-tight text-text mb-1.5">Quick Match</h1>
              <p className="text-muted text-sm mb-5 leading-relaxed">Choose your challenge type and find a worthy opponent.</p>

              {/* Question Type Toggle */}
              <div className="flex bg-surface2 border border-border rounded-md overflow-hidden mb-5">
                <button onClick={() => setQuestionType('random')}
                  className={`flex-1 py-2.5 text-center text-sm font-medium cursor-pointer transition-all border-none bg-transparent ${questionType === 'random' ? 'bg-ember/[0.08] text-ember' : 'text-muted hover:text-text2 hover:bg-surface3'}`}>
                  🎲 Random
                </button>
                <button onClick={() => setQuestionType('manual')}
                  className={`flex-1 py-2.5 text-center text-sm font-medium cursor-pointer transition-all border-none bg-transparent ${questionType === 'manual' ? 'bg-ember/[0.08] text-ember' : 'text-muted hover:text-text2 hover:bg-surface3'}`}>
                  📝 Custom URL
                </button>
              </div>

              {/* Random: Difficulty */}
              {questionType === 'random' && (
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {['easy', 'medium', 'hard'].map(d => {
                    const colors = {
                      easy: { border: 'border-mint', text: 'text-mint', bg: 'bg-mint/[0.06]' },
                      medium: { border: 'border-gold', text: 'text-gold', bg: 'bg-gold/[0.06]' },
                      hard: { border: 'border-flame', text: 'text-flame', bg: 'bg-flame/[0.06]' },
                    };
                    const c = colors[d];
                    const selected = difficulty === d;
                    return (
                      <button key={d} onClick={() => setDifficulty(d)}
                        className={`py-2 text-center text-sm font-semibold rounded-md cursor-pointer transition-all border capitalize ${selected ? `${c.border} ${c.text} ${c.bg}` : 'border-border bg-surface2 text-muted hover:border-text2/20 hover:text-text2'}`}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Custom URL */}
              {questionType === 'manual' && (
                <div className="mb-5">
                  <label className="block text-xs font-medium text-text2 mb-1.5">LeetCode URL</label>
                  <input type="url" value={problemUrl} onChange={e => setProblemUrl(e.target.value)} placeholder="https://leetcode.com/problems/two-sum/"
                    className="w-full bg-surface2 border border-border rounded-md text-text text-sm p-2.5 transition-all outline-none focus:border-ember/50 focus:ring-1 focus:ring-ember/20 placeholder:text-muted" />
                </div>
              )}

              <button onClick={startSearch}
                className="w-full py-2.5 px-6 bg-ember hover:bg-ember-glow text-white font-semibold rounded-md border-none cursor-pointer shadow-[0_4px_16px_rgba(255,107,53,0.2)] hover:translate-y-[-1px] transition-all duration-200 text-sm">
                ⚔️ Find Opponent
              </button>
            </>
          )}
        </div>
      </main>
    </>
  );
}