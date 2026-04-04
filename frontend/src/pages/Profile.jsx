import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';
import { useAuth } from '../hooks/useAuth';
import { getArena, formatTime } from '../lib/utils';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) return (
    <>
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-border border-t-ember rounded-full animate-spin" /></div>
    </>
  );

  if (!user) return null; // Let ProtectedRoute catch them

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
      <main className="flex-1 relative z-[1]">
        <div className="max-w-[1000px] mx-auto mt-10 px-6 flex gap-6 animate-cardEntry max-[768px]:flex-col">
          {/* Sidebar */}
          <div className="w-[280px] max-[768px]:w-full">
            <div className="bg-surface/70 backdrop-blur-xl shadow-glass-inset border border-white/5 shadow-2xl rounded-lg p-7 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ember via-gold to-ember/20" />
              
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ember/20 to-ember/5 border-2 border-ember/40 mx-auto flex items-center justify-center text-2xl mb-3">
                ⚡
              </div>
              <div className="font-display text-lg font-bold tracking-tight text-text">{user.username}</div>
              <div className="text-sm font-semibold mt-0.5 font-mono" style={{ color: arena.color }}>
                {arena.name}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5 mt-5">
                {[
                  { label: 'Rating', value: user.rating, color: 'text-ember' },
                  { label: 'Matches', value: totalGames, color: 'text-text' },
                  { label: 'Wins', value: user.wins, color: 'text-mint' },
                  { label: 'Losses', value: user.losses, color: 'text-flame' },
                ].map(s => (
                  <div key={s.label} className="bg-surface2 border border-border rounded-md py-2.5 px-2">
                    <div className={`font-display text-base font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[0.62rem] text-muted font-medium uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 bg-surface2 border border-border rounded-md py-2.5">
                <div className="font-display text-xl font-bold text-gold">{winRate}%</div>
                <div className="text-[0.62rem] text-muted font-medium uppercase tracking-wider">Win Rate</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Rating Chart */}
            {(user.ratingHistory || []).length > 1 && (
              <div className="bg-surface/70 backdrop-blur-xl shadow-glass-inset border border-white/5 shadow-2xl rounded-lg p-5 mb-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ember/40 to-transparent" />
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Rating History</h2>
                <div className="h-48">
                  <Line data={chartData} options={chartOpts} />
                </div>
              </div>
            )}

            {/* Match History */}
            <div className="bg-surface/70 backdrop-blur-xl shadow-glass-inset border border-white/5 shadow-2xl rounded-lg p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ember/40 to-transparent" />
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Match History</h2>
              {(!user.matchHistory || user.matchHistory.length === 0) ? (
                <div className="text-center py-8 text-muted">
                  <div className="text-3xl mb-2">⚔️</div>
                  <div className="font-semibold text-text text-sm">No battles yet</div>
                  <div className="text-sm mt-1">Your match history will appear here after your first duel.</div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[450px] overflow-y-auto">
                  {user.matchHistory.map((m, i) => (
                    <div key={i} className={`flex items-center justify-between p-3.5 rounded-md border transition-all hover:bg-surface2/50 ${m.result === 'Win' ? 'border-l-[3px] border-l-mint border-t-border border-r-border border-b-border bg-mint/[0.02]' : 'border-l-[3px] border-l-flame border-t-border border-r-border border-b-border bg-flame/[0.02]'}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-sm font-semibold ${m.result === 'Win' ? 'text-mint' : 'text-flame'}`}>
                            {m.result === 'Win' ? '🏆 Victory' : '💀 Defeat'}
                          </span>
                          {m.isRated && <span className="text-[0.6rem] bg-violet/10 text-violet border border-violet/20 rounded-full px-1.5 py-0.5 font-mono">RATED</span>}
                        </div>
                        <div className="text-sm text-text font-medium">{m.problemTitle || 'Unknown'}</div>
                        <div className="text-xs text-muted mt-0.5">
                          vs <span className="text-text2">{m.opponentName}</span>
                          {m.difficulty && <span className={`ml-2 ${m.difficulty === 'Easy' ? 'text-mint' : m.difficulty === 'Medium' ? 'text-gold' : 'text-flame'}`}>{m.difficulty}</span>}
                          {m.timeTaken > 0 && <span className="ml-2">⏱ {formatTime(m.timeTaken)}</span>}
                        </div>
                      </div>
                      {m.isRated && (
                        <div className={`text-right font-display text-base font-bold ${m.ratingDelta >= 0 ? 'text-mint' : 'text-flame'}`}>
                          {m.ratingDelta >= 0 ? '+' : ''}{m.ratingDelta}
                          <div className="text-[0.6rem] text-muted font-mono font-normal">{m.newRating} Elo</div>
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