import { useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';
import { useAuth } from '../hooks/useAuth';
import { getArena, formatTime } from '../lib/utils';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { toPng } from 'html-to-image';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function Profile() {
  const { user, loading } = useAuth();
  const cardRef = useRef(null);

  const handleDownloadCard = useCallback(async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: '#0c0c0f' });
      const link = document.createElement('a');
      link.download = `EleeteCard-${user.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export card', err);
      alert('Could not download image. Ensure all assets are loaded.');
    }
  }, [user]);

  const handleShareLinked = () => {
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-border border-t-ember rounded-full animate-spin" /></div>
    </>
  );

  if (!user) return null; // ProtectedRoute will catch

  const arena = getArena(user.rating);
  const totalGames = user.wins + user.losses;
  const winRate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(1) : '0.0';

  const chartData = {
    labels: (user.ratingHistory || []).map((_, i) => `${i + 1}`),
    datasets: [{
      data: (user.ratingHistory || []).map(r => r.rating),
      borderColor: '#ff6b35',
      backgroundColor: 'rgba(255,107,53,0.05)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointBackgroundColor: '#ff6b35',
      pointBorderColor: '#ff6b35',
      borderWidth: 2,
    }],
  };
  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: { display: false },
      y: { grid: { color: 'rgba(42,42,53,0.5)' }, ticks: { color: '#63636e', font: { family: 'JetBrains Mono', size: 10 } } },
    },
  };

  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 relative z-[1] overflow-x-hidden pb-20">
        <div className="max-w-[1100px] mx-auto mt-12 px-6 animate-cardEntry">
          
          {/* HERO SECTION: The Card & Social CTA */}
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-10 lg:gap-20 mb-16 px-4">
            
            {/* LEFT: Exportable Card Container */}
            <div className="shrink-0 w-full max-w-[360px] relative p-1 rounded-[2rem] bg-gradient-to-b from-ember/40 via-surface to-border shadow-[0_20px_60px_rgba(255,107,53,0.15)] group" ref={cardRef}>
              <div className="bg-[#111114] w-full h-full rounded-[1.8rem] overflow-hidden relative flex flex-col p-6 isolate">
                {/* Background Decorations for Image Export */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-ember/50 to-transparent" />
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-ember/10 blur-[60px] rounded-full z-[-1]" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-violet/10 blur-[60px] rounded-full z-[-1]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay z-[-1]" />

                {/* Header */}
                <div className="flex justify-between items-start mb-8 tracking-widest uppercase items-center">
                  <div className="text-[10px] font-black text-text bg-surface3/50 px-2.5 py-1 rounded-sm border border-white/5">
                    Eleete<span className="text-ember">Battle</span>
                  </div>
                  <div className="text-[9px] font-black" style={{ color: arena.color }}>{arena.name}</div>
                </div>

                {/* Avatar */}
                <div className="flex justify-center mb-5">
                   <div className="w-28 h-28 rounded-full bg-gradient-to-br from-violet/20 to-ember/20 border-2 border-ember/30 shadow-[0_0_20px_rgba(255,107,53,0.2)] flex items-center justify-center text-5xl font-display font-bold text-text relative">
                     {user.username.charAt(0).toUpperCase()}
                     <div className="absolute bottom-1 right-1 w-7 h-7 bg-[#111114] border border-ember/30 rounded-full flex items-center justify-center text-sm shadow-md">
                       ⚔️
                     </div>
                   </div>
                </div>

                {/* User Info */}
                <div className="text-center mb-8">
                  <div className="font-display text-2xl font-black text-text flex items-center justify-center gap-1.5 drop-shadow-md">
                    {user.username} <span className="text-mint text-xl shadow-none">✓</span>
                  </div>
                  <div className="text-xs text-muted/70 font-mono mt-0.5">@eleetebattle_user</div>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#1c1c22]/80 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5">Rating</span>
                    <span className="text-2xl font-mono font-bold text-ember drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]">{user.rating}</span>
                  </div>
                  <div className="bg-[#1c1c22]/80 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5">Win Rate</span>
                    <span className="text-2xl font-mono font-bold text-gold drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">{winRate}%</span>
                  </div>
                </div>

                {/* Secondary Info */}
                <div className="bg-[#1c1c22]/50 border border-white/5 rounded-xl p-4 text-center mt-auto">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Lifetime Record</div>
                  <div className="flex items-center justify-center gap-4 text-sm font-semibold tracking-wide">
                    <span><span className="text-text">{totalGames}</span> <span className="text-muted text-xs">Total</span></span>
                    <span className="w-1 h-1 bg-border rounded-full" />
                    <span><span className="text-mint">{user.wins}</span> <span className="text-muted text-xs">W</span></span>
                    <span className="w-1 h-1 bg-border rounded-full" />
                    <span><span className="text-flame">{user.losses}</span> <span className="text-muted text-xs">L</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Social Share CTA */}
            <div className="flex-1 flex flex-col justify-center items-center text-center">
               <div className="text-6xl mb-4 animate-float">🦉</div>
               <h2 className="font-display text-4xl md:text-5xl font-black text-text mb-2 tracking-tight">
                 Share your <br/><span className="bg-gradient-to-r from-ember to-gold bg-clip-text text-transparent italic">#EleeteCard</span>
               </h2>
               <p className="text-muted text-sm md:text-base font-medium tracking-wide mb-8">
                 with friends, opponents, and recruiters!
               </p>

               <div className="flex gap-3">
                 <button onClick={handleDownloadCard} className="px-6 py-3 bg-ember hover:bg-ember-glow text-white font-semibold rounded-lg shadow-[0_4px_24px_rgba(255,107,53,0.3)] transition-transform duration-200 hover:-translate-y-1 flex items-center justify-center gap-2 border-none cursor-pointer">
                   ↓ Download
                 </button>
                 <button onClick={() => {
                     navigator.clipboard.writeText('Check out my #EleeteCard format on EleeteBattle! ⚔️');
                     alert('Copied to clipboard!');
                   }} 
                   className="w-12 h-12 bg-surface2 border border-border text-text hover:text-ember hover:border-ember/30 rounded-lg flex items-center justify-center shadow-lg transition-all cursor-pointer">
                   🔗
                 </button>
               </div>

               <button onClick={handleShareLinked} className="mt-8 px-6 py-2.5 bg-[#0a66c2] hover:bg-[#004182] text-white text-sm font-semibold rounded-[4px] border-none cursor-pointer transition-colors flex items-center justify-center gap-2">
                 <span className="font-bold">in</span> Share on LinkedIn
               </button>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-16" />

          {/* BOTTOM SECTION: Existing Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Rating Chart */}
            <div className="bg-surface/50 backdrop-blur-xl shadow-glass-inset border border-white/5 shadow-2xl rounded-xl p-5 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ember/40 to-transparent" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-4 ml-1">Rating History</h2>
              {(!user.ratingHistory || user.ratingHistory.length <= 1) ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-muted/50">
                    <div className="text-2xl mb-2">📈</div>
                    <div className="text-sm font-medium">Keep competing to see your rating curve</div>
                 </div>
              ) : (
                <div className="h-48">
                  <Line data={chartData} options={chartOpts} />
                </div>
              )}
            </div>

            {/* Match History */}
            <div className="bg-surface/50 backdrop-blur-xl shadow-glass-inset border border-white/5 shadow-2xl rounded-xl p-5 relative overflow-hidden flex flex-col max-h-[400px]">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ember/40 to-transparent" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-4 ml-1">Match History</h2>
              
              {(!user.matchHistory || user.matchHistory.length === 0) ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-muted/50">
                  <div className="text-3xl mb-2">⚔️</div>
                  <div className="font-medium text-sm">No battles yet</div>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                  {user.matchHistory.map((m, i) => (
                    <div key={i} className={`flex items-center justify-between p-3.5 rounded-lg border transition-all hover:bg-surface3/40 ${m.result === 'Win' ? 'border-l-[4px] border-l-mint border-t-white/5 border-r-white/5 border-b-white/5 bg-mint/[0.02]' : 'border-l-[4px] border-l-flame border-t-white/5 border-r-white/5 border-b-white/5 bg-flame/[0.02]'}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-black uppercase tracking-wider ${m.result === 'Win' ? 'text-mint' : 'text-flame'}`}>
                            {m.result === 'Win' ? '🏆 Victory' : '💀 Defeat'}
                          </span>
                          {m.isRated && <span className="text-[0.55rem] bg-violet/10 text-violet border border-violet/20 rounded-sm px-1 py-0.5 font-bold tracking-widest font-mono">RATED</span>}
                        </div>
                        <div className="text-sm font-display font-bold text-text">{m.problemTitle || 'Unknown'}</div>
                        <div className="text-xs text-muted/70 mt-0.5 font-medium">
                          vs <span className="text-text2">{m.opponentName}</span>
                          {m.difficulty && <span className={`ml-2 ${m.difficulty === 'Easy' ? 'text-mint' : m.difficulty === 'Medium' ? 'text-gold' : 'text-flame'}`}>{m.difficulty}</span>}
                          {m.timeTaken > 0 && <span className="ml-2 opacity-50">| {formatTime(m.timeTaken)}</span>}
                        </div>
                      </div>
                      {m.isRated && (
                        <div className={`text-right font-mono text-base font-bold drop-shadow-md ${m.ratingDelta >= 0 ? 'text-mint' : 'text-flame'}`}>
                          {m.ratingDelta >= 0 ? '+' : ''}{m.ratingDelta}
                          <div className="text-[0.6rem] text-muted font-mono font-medium">{m.newRating} Elo</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </main>
    </>
  );
}