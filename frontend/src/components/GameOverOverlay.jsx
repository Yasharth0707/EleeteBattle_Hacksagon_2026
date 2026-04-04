import { Link } from 'react-router-dom';
import { formatTime } from '../lib/utils';

export default function GameOverOverlay({ data, mySocketId }) {
  if (!data) return null;

  const isWinner = data.winnerId === mySocketId;
  const elapsed = data.elapsedSeconds || 0;
  const timeStr = formatTime(elapsed);

  return (
    <div className="fixed inset-0 bg-bg/90 backdrop-blur-lg flex items-center justify-center z-[1000] animate-fadeIn">
      <div className={`relative bg-surface border rounded-lg p-10 text-center max-w-[400px] w-[92%] shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-popIn overflow-hidden ${isWinner ? 'border-mint/40 winner-glow' : 'border-border'}`}>
        {/* Accent stripe at top */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${isWinner ? 'bg-gradient-to-r from-mint via-gold to-ember' : 'bg-gradient-to-r from-flame/60 to-flame/20'}`} />

        <div className="text-5xl mb-4 mt-2">
          {isWinner ? '🏆' : '😔'}
        </div>
        <div className="font-display text-2xl font-bold mb-2 tracking-tight">
          {isWinner ? 'Victory!' : 'Defeated'}
        </div>
        <div className="text-muted mb-6 leading-relaxed text-sm">
          {data.forfeit ? (
            isWinner
              ? <span>Your opponent left the battle. Win by forfeit!</span>
              : <span>You left the battle. Instant forfeit.</span>
          ) : isWinner
            ? <span>Solved in <span className="text-mint font-mono font-semibold">{timeStr}</span>. Incredible! 🔥</span>
            : <span><span className="text-text font-semibold">{data.winnerName}</span> finished in {timeStr}. Next time!</span>
          }
          {data.isRated && (
            <div className={`mt-3 text-lg font-bold font-mono ${isWinner ? 'text-mint' : 'text-flame'}`}>
              {isWinner ? `+${data.ratingChangeWinner}` : data.ratingChangeLoser} Elo{' '}
              <span className="text-sm text-muted font-normal">
                → {isWinner ? data.winnerNewRating : data.loserNewRating}
              </span>
            </div>
          )}
        </div>
        <Link to="/" className="no-underline block">
          <button className="w-full py-3 px-6 bg-ember hover:bg-ember-glow text-white font-semibold rounded-md border-none cursor-pointer shadow-[0_4px_16px_rgba(255,107,53,0.25)] hover:shadow-[0_6px_24px_rgba(255,107,53,0.3)] transition-all duration-200 hover:translate-y-[-1px]">
            Play Again
          </button>
        </Link>
      </div>
    </div>
  );
}