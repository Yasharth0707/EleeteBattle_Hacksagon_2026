import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); return; }
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch {
      setError('Server communication error');
    }
  };

  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8 relative z-[1]">
        <div className="max-w-[380px] w-full animate-cardEntry">
          <div className="bg-surface/70 backdrop-blur-xl shadow-glass-inset border border-white/5 shadow-2xl rounded-lg p-8">
            <h2 className="font-display text-xl font-bold text-text mb-1 tracking-tight">Create your account</h2>
            <p className="text-muted text-sm mb-6">Join the arena and start competing</p>
            {error && <div className="text-flame bg-flame/[0.08] border border-flame/20 rounded-md px-3 py-2 mb-4 text-sm font-medium">{error}</div>}
            <form onSubmit={handleSubmit}>
              <label className="block text-xs font-medium text-text2 mb-1.5">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a username" required autoComplete="username" minLength={3}
                className="w-full p-2.5 mb-4 bg-surface/50 border border-border rounded-md text-text text-sm transition-all duration-200 outline-none focus:border-ember/50 focus:ring-2 focus:ring-ember/20 focus:bg-surface2 placeholder:text-muted" />
              <label className="block text-xs font-medium text-text2 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required autoComplete="new-password" minLength={6}
                className="w-full p-2.5 mb-5 bg-surface/50 border border-border rounded-md text-text text-sm transition-all duration-200 outline-none focus:border-ember/50 focus:ring-2 focus:ring-ember/20 focus:bg-surface2 placeholder:text-muted" />
              <button type="submit" className="w-full p-2.5 bg-ember hover:bg-ember-glow border-none rounded-md text-white font-semibold text-sm cursor-pointer shadow-glow-ember transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_4px_24px_rgba(255,107,53,0.5)]">
                Create account
              </button>
            </form>
            <div className="mt-5 text-sm text-muted text-center">
              Already have an account?{' '}
              <a href="/login" className="text-ember no-underline font-semibold hover:text-ember-glow transition-colors">Log in</a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}