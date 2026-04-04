import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';
import TextType from "../components/TextType";


const arenas = [
  { name: 'Bronze', req: '0 – 1399', color: 'bg-[#cd7f32]' },
  { name: 'Silver', req: '1400 – 1799', color: 'bg-[#94a3b8]' },
  { name: 'Gold', req: '1800 – 2199', color: 'bg-gold' },
  { name: 'Diamond', req: '2200 – 2599', color: 'bg-ice' },
  { name: 'Master', req: '2600 – 2999', color: 'bg-violet' },
  { name: 'Grand Champ', req: '3000+', color: 'bg-ember' },
];

export default function Landing() {
  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-[1] min-h-[calc(100vh-56px)]">
        {/* Hero */}
        <div className="text-center mb-14 animate-cardEntry">
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
          <Link to="/invite" className="group bg-surface border border-border rounded-lg p-7 cursor-pointer transition-all duration-300 relative overflow-hidden no-underline block hover:translate-y-[-4px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-ember/30">
            <div className="absolute top-0 left-0 w-1 h-full bg-ember rounded-r-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

          <Link to="/matchmaking" className="group bg-surface border border-border rounded-lg p-7 cursor-pointer transition-all duration-300 relative overflow-hidden no-underline block hover:translate-y-[-4px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-violet/30">
            <div className="absolute top-0 left-0 w-1 h-full bg-violet rounded-r-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
        <div className="flex gap-10 mt-12 animate-[cardEntry_0.5s_cubic-bezier(0.22,1,0.36,1)_0.2s_both] max-[560px]:flex-col max-[560px]:gap-3">
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
        <div className="mt-24 pt-12 border-t border-border text-center w-full max-w-[680px]">
          <h2 className="font-display text-2xl font-bold text-text mb-2 tracking-tight">Climb The Ranks</h2>
          <p className="text-muted text-base mb-10">Win matches to gain Elo. You'll only be matched within your arena.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {arenas.map(a => (
              <div key={a.name} className="flex items-center gap-2.5 bg-surface border border-border rounded-full px-5 py-2.5 transition-all duration-200 hover:border-text2/20 hover:bg-surface2">
                <div className={`w-2.5 h-2.5 rounded-full ${a.color}`} />
                <span className="text-sm font-semibold text-text">{a.name}</span>
                <span className="text-xs text-muted font-mono">{a.req}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}