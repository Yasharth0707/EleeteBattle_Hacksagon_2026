import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-8 h-14 border-b border-border bg-bg/90 backdrop-blur-md sticky top-0 z-[100]">
      <Link to="/" className="font-display text-lg font-bold tracking-tight text-ember no-underline hover:text-ember-glow transition-colors">
        EleeteBattle
      </Link>

      <div className="flex items-center gap-1">
        <Link to="/join" className="text-muted text-sm font-medium px-3 py-1.5 rounded-md transition-all duration-200 hover:text-text hover:bg-surface2 no-underline">
          Join Room
        </Link>
        <Link to="/leaderboard" className="text-muted text-sm font-medium px-3 py-1.5 rounded-md transition-all duration-200 hover:text-text hover:bg-surface2 no-underline">
          Leaderboard
        </Link>

        {user ? (
          <>
            <Link to="/profile" className="text-muted text-sm font-medium px-3 py-1.5 rounded-md transition-all duration-200 hover:text-text hover:bg-surface2 no-underline">
              Profile
            </Link>
            <div className="w-px h-5 bg-border mx-1" />
            <span className="text-text text-sm font-semibold px-2">
              {user.username}
              <span className="text-muted text-xs ml-1.5 font-mono">{user.rating}</span>
            </span>
            <button onClick={logout} className="text-muted text-sm bg-transparent border-none cursor-pointer hover:text-flame transition-colors ml-1 px-2 py-1 rounded-md hover:bg-flame/5">
              Log out
            </button>
          </>
        ) : (
          <>
            <div className="w-px h-5 bg-border mx-1" />
            <Link to="/login" className="text-text2 text-sm font-medium px-3 py-1.5 rounded-md transition-all duration-200 hover:text-text hover:bg-surface2 no-underline">
              Log in
            </Link>
            <Link to="/register" className="text-bg text-sm font-semibold px-3.5 py-1.5 rounded-md bg-ember hover:bg-ember-glow transition-all duration-200 no-underline">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}