import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';
import TextType from "../components/TextType";

const arenas = [
  { name: 'Bronze', req: '0 - 1399', hex: '#cd7f32', icon: '🥉' },
  { name: 'Silver', req: '1400 - 1799', hex: '#94a3b8', icon: '🥈' },
  { name: 'Gold', req: '1800 - 2199', hex: '#f59e0b', icon: '🥇' },
  { name: 'Diamond', req: '2200 - 2599', hex: '#6c9fff', icon: '💎' },
  { name: 'Master', req: '2600 - 2999', hex: '#8b5cf6', icon: '🔮' },
  { name: 'Grand Champ', req: '3000+', hex: '#ff6b35', icon: '🔥' },
];

export default function Landing() {
  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-[1] min-h-[calc(100vh-56px)]">
        {/* Hero */}
        <div className="text-center mb-14 animate-floatSlow">
          <div className="inline-flex items-center gap-2 bg-ember/[0.08] border border-ember/[0.15] rounded-full px-4 py-1.5 text-xs font-semibold text-ember mb-6 tracking-wide">
            <div className="w-1.5 h-1.5 bg-mint rounded-full animate-blink" />
            Real-time 1v1 Battles
          </div>
          <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-bold tracking-tight leading-[1.1] mb-4 flex justify-center gap-3">
            <span className="text-text">
              <TextType 
                text="Code."
                typingSpeed={120}
                initialDelay={0}
                showCursor={false}
                loop={true}
                pauseDuration={6000}
                deletingSpeed={80}
              />
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ember to-gold">
              <TextType 
                text="Battle."
                typingSpeed={120}
                initialDelay={700}
                showCursor={false}
                loop={true}
                pauseDuration={6000}
                deletingSpeed={80}
              />
            </span>
            <span className="text-text">
              <TextType 
                text="Win."
                typingSpeed={120}
                initialDelay={1600}
                showCursor={false}
                loop={true}
                pauseDuration={6000}
                deletingSpeed={80}
              />
            </span>
          </h1>

          <p className="text-text2 text-lg max-w-[480px] mx-auto leading-relaxed">
            The competitive LeetCode arena. Challenge friends or find opponents — first accepted solution wins.
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-2 gap-5 max-w-[680px] w-full animate-[cardEntry_0.5s_cubic-bezier(0.22,1,0.36,1)_0.1s_both] max-[768px]:grid-cols-1 max-[768px]:max-w-[380px]">
          <Link to="/invite" className="group bg-surface/70 backdrop-blur-md shadow-lg border border-border rounded-lg p-7 cursor-pointer transition-all duration-300 relative overflow-hidden no-underline block hover:translate-y-[-4px] hover:shadow-glow-ember hover:border-ember/40">
            <div className="absolute top-0 left-0 w-1 h-full bg-ember rounded-r-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_#ff6b35]" />
            <span className="text-[2rem] mb-3 block">🎯</span>
            <div className="font-display text-base font-bold tracking-tight text-text mb-1.5">Challenge Friend</div>
            <div className="text-muted text-sm leading-relaxed mb-4">
              Pick a LeetCode problem, create a room, and share the code with your friend.
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-[0.65rem] font-medium px-2.5 py-1 rounded-full tracking-wide bg-ember/[0.08] text-ember border border-ember/[0.12]">Room Code</span>
              <span className="text-[0.65rem] font-medium px-2.5 py-1 rounded-full tracking-wide bg-mint/[0.08] text-mint border border-mint/[0.12]">Pick Problem</span>
            </div>
          </Link>

          <Link to="/matchmaking" className="group bg-surface/70 backdrop-blur-md shadow-lg border border-border rounded-lg p-7 cursor-pointer transition-all duration-300 relative overflow-hidden no-underline block hover:translate-y-[-4px] hover:shadow-glow-violet hover:border-violet/40">
            <div className="absolute top-0 left-0 w-1 h-full bg-violet rounded-r-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_#8b5cf6]" />
            <span className="text-[2rem] mb-3 block">⚔️</span>
            <div className="font-display text-base font-bold tracking-tight text-text mb-1.5">Quick Match</div>
            <div className="text-muted text-sm leading-relaxed mb-4">
              Queue up and get matched with a random opponent. Choose your difficulty level.
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-[0.65rem] font-medium px-2.5 py-1 rounded-full tracking-wide bg-violet/[0.08] text-violet border border-violet/[0.12]">Auto Match</span>
              <span className="text-[0.65rem] font-medium px-2.5 py-1 rounded-full tracking-wide bg-gold/[0.08] text-gold border border-gold/[0.12]">Random Q</span>
            </div>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="flex gap-10 mt-12 mb-10 animate-[cardEntry_0.5s_cubic-bezier(0.22,1,0.36,1)_0.2s_both] max-[560px]:flex-col max-[560px]:gap-3">
          {[
            { icon: '⚡', label: 'Real-Time' },
            { icon: '🏆', label: 'First Wins' },
            { icon: '📝', label: 'Any Problem' },
            { icon: '🎲', label: 'Matchmaking' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-xl mb-0.5">{s.icon}</div>
              <div className="text-xs text-muted font-medium tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Arenas */}
        <div className="mt-20 pt-16 border-t border-white/5 text-center w-full max-w-[900px] mb-20 animate-slideUp">
          <h2 className="font-display text-4xl font-black text-text mb-4 tracking-tight drop-shadow-md">Climb The Ranks</h2>
          <p className="text-muted text-lg mb-12 max-w-[600px] mx-auto">Win competitive duels to gain Elo. You will only be matched against opponents within your specific tier.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {arenas.map((a, i) => (
              <div key={a.name} className="group relative bg-surface/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden animate-[cardEntry_0.5s_both]" style={{ animationDelay: `${0.3 + (i * 0.1)}s` }}>
                
                {/* Dynamic Base Glow */}
                <div className="absolute inset-0 opacity-10 transition-opacity duration-500 rounded-2xl z-0" 
                     style={{ background: `radial-gradient(circle at 50% 120%, ${a.hex} 0%, transparent 80%)` }} />
                
                {/* Intense Hover Glow Layer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl z-0" 
                     style={{ background: `radial-gradient(circle at 50% 50%, ${a.hex}15 0%, transparent 100%)`, 
                              boxShadow: `inset 0 0 30px ${a.hex}25, 0 10px 40px ${a.hex}30` }} />
                
                <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{ background: `linear-gradient(90deg, transparent, ${a.hex}, transparent)` }} />

                <div className="relative z-10 flex flex-col items-center">
                   <div className="text-6xl mb-5 animate-float group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                     {a.icon}
                   </div>
                   <h3 className="font-display text-2xl font-bold text-text mb-2 drop-shadow-sm group-hover:text-white transition-colors">{a.name}</h3>
                   <div className="text-xs font-mono font-bold tracking-[0.15em] uppercase px-3 py-1 rounded bg-bg/60 border border-white/5 group-hover:bg-bg/90 transition-colors" style={{ color: a.hex }}>
                     {a.req} ELO
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}