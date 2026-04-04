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

  const getPodiumColor = (i) => {
    if (i === 0) return 'from-[#f59e0b]/30 to-[#f59e0b]/5 border-[#f59e0b]/40 shadow-[0_-10px_40px_rgba(245,158,11,0.25)] text-[#f59e0b]'; // Gold
    if (i === 1) return 'from-[#94a3b8]/30 to-[#94a3b8]/5 border-[#94a3b8]/40 shadow-[0_-10px_30px_rgba(148,163,184,0.15)] text-[#94a3b8]'; // Silver
    if (i === 2) return 'from-[#cd7f32]/30 to-[#cd7f32]/5 border-[#cd7f32]/40 shadow-[0_-10px_30px_rgba(205,127,50,0.15)] text-[#cd7f32]'; // Bronze
    return '';
  };

  const getPodiumPillarDims = (i) => {
    if (i === 0) return 'h-[180px] md:h-[220px] z-10 md:-translate-y-8';
    if (i === 1) return 'h-[140px] md:h-[160px] z-0 md:translate-x-4';
    if (i === 2) return 'h-[120px] md:h-[130px] z-0 md:-translate-x-4';
    return '';
  };

  const top3 = rows ? rows.slice(0, 3) : [];
  const rest = rows ? rows.slice(3) : [];

  const displayTop3 = [];
  if (top3[1]) displayTop3.push({ ...top3[1], origRank: 1, pos: 'left' });
  if (top3[0]) displayTop3.push({ ...top3[0], origRank: 0, pos: 'center' });
  if (top3[2]) displayTop3.push({ ...top3[2], origRank: 2, pos: 'right' });

  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 relative z-[1] overflow-x-hidden">
        <div className="max-w-[860px] mx-auto mt-12 px-6 pb-20">
          <div className="text-center mb-16 animate-slideUp">
            <h1 className="font-display text-4xl md:text-5xl font-black bg-gradient-to-r from-ember via-gold to-ember bg-clip-text text-transparent tracking-tight mb-3 uppercase animate-shimmer" style={{ backgroundSize: '200% auto' }}>Leaderboard</h1>
            <p className="text-muted text-xs md:text-sm font-bold tracking-[0.25em] uppercase">The Pantheon of EleeteBattle</p>
          </div>
          
          {error && <div className="p-6 text-center text-flame bg-flame/10 border border-flame/20 rounded-lg animate-shake">{error}</div>}
          
          {!rows && !error && (
             <div className="flex flex-col items-center justify-center py-24 gap-5 text-ember animate-pulse">
               <div className="w-12 h-12 border-4 border-surface3 border-t-ember rounded-full animate-spin shadow-glow-ember" />
               <span className="text-xs font-bold tracking-[0.2em] uppercase">Summoning Rankings...</span>
             </div>
          )}

          {rows && rows.length > 0 && (
            <>
              {/* PODIUM SECTION */}
              <div className="flex flex-row items-end justify-center gap-2 md:gap-0 mt-20 mb-24 px-2 md:px-12 mx-auto max-w-[700px]">
                {displayTop3.map((user, idx) => (
                  <div key={user.id} className={`flex-1 flex flex-col relative animate-slideUp group`} style={{ animationDelay: `${(idx + 1) * 0.15}s` }}>
                    {/* Avatar & Stats */}
                    <div className={`flex flex-col items-center justify-end pb-4 transition-transform duration-500 group-hover:-translate-y-3 ${user.pos === 'center' ? 'md:-translate-y-8 z-10' : ''}`}>
                       {user.origRank === 0 && <div className="text-5xl md:text-6xl mb-3 animate-float drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">👑</div>}
                       {user.origRank !== 0 && <div className={`text-2xl md:text-3xl mb-3 font-black drop-shadow-md ${user.origRank === 1 ? 'text-[#94a3b8]' : 'text-[#cd7f32]'}`}>#{user.origRank + 1}</div>}
                       
                       <div className="font-display font-black text-base md:text-xl text-text truncate w-full text-center px-1 drop-shadow-md">{user.username}</div>
                       <div className="text-xs md:text-sm font-mono font-bold text-ember mt-1 bg-surface2/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/5">{user.rating} Elo</div>
                       <div className="text-[0.6rem] md:text-[0.65rem] uppercase tracking-wider font-bold mt-2 bg-bg/50 px-2 py-1 rounded-full border border-white/5 hidden md:block">
                         <span className="text-mint">{user.wins}</span> W <span className="opacity-40 text-white mx-1">|</span> <span className="text-flame">{user.losses}</span> L
                       </div>
                    </div>
                    
                    {/* Glass Pillar */}
                    <div className={`w-full bg-gradient-to-t ${getPodiumColor(user.origRank)} border-t-2 border-l border-r border-l-black/20 border-r-black/20 backdrop-blur-2xl rounded-t-2xl opacity-90 group-hover:opacity-100 transition-all duration-300 ${getPodiumPillarDims(user.origRank)} flex items-end justify-center pb-4 md:pb-6 relative overflow-hidden`}>
                      {/* Inner glare effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
                      <span className="text-6xl md:text-8xl font-display font-black mix-blend-overlay opacity-30 drop-shadow-md">{user.origRank + 1}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* LIST SECTION */}
              {rest.length > 0 && (
                <div className="space-y-3 relative z-20">
                  <div className="flex items-center px-4 md:px-8 py-2 text-[0.65rem] md:text-xs font-bold text-muted uppercase tracking-[0.15em] mb-3 border-b border-white/10 ml-2 mr-2">
                    <div className="w-12 md:w-20">Rank</div>
                    <div className="flex-1">Player</div>
                    <div className="w-20 md:w-28 text-right">Rating</div>
                    <div className="w-20 md:w-28 text-right">Record</div>
                  </div>
                  {rest.map((user, i) => (
                    <div key={user.id} className="group relative bg-surface/50 backdrop-blur-xl border border-white/5 rounded-xl px-4 md:px-8 py-4 md:py-5 flex items-center transition-all duration-300 hover:bg-surface3/80 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,107,53,0.15)] animate-slideUp overflow-hidden" style={{ animationDelay: `${(i + 4) * 0.05}s` }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-ember/0 via-ember/5 to-ember/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                      
                      <div className="w-12 md:w-20 font-mono font-black text-muted/50 group-hover:text-ember transition-colors text-sm md:text-base">#{i + 4}</div>
                      <div className="flex-1 font-display font-bold text-text text-sm md:text-lg drop-shadow-sm">{user.username}</div>
                      <div className="w-20 md:w-28 text-right font-mono text-sm md:text-base font-bold text-ember drop-shadow-[0_0_8px_rgba(255,107,53,0.3)]">{user.rating}</div>
                      <div className="w-20 md:w-28 text-right text-xs md:text-sm font-bold tracking-wide">
                        <span className="text-mint drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">{user.wins}</span>
                        <span className="text-muted/40 mx-1.5 md:mx-2">/</span>
                        <span className="text-flame drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">{user.losses}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {rows && rows.length === 0 && (
            <div className="p-16 text-center text-muted font-medium bg-surface/50 border border-white/5 rounded-2xl backdrop-blur-md shadow-glass-inset mt-10">
              <div className="text-4xl mb-4 opacity-50">⚔️</div>
              <div className="text-sm tracking-wide">The arena is empty. Await the first champions.</div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}