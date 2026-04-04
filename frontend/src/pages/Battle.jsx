import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import GameOverOverlay from '../components/GameOverOverlay';
import { LANG_CONFIG, formatTime } from '../lib/utils';

export default function Battle() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomCode = searchParams.get('code');
  const socket = useSocket();
  const { token } = useAuth();

  // ─── State ─────────────────────────────────────────────────────
  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [code, setCode] = useState('// Write your solution here...\n');
  const [language, setLanguage] = useState('python3');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(null);
  const [players, setPlayers] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState('output');
  const [submissions, setSubmissions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [cookieSession, setCookieSession] = useState('');
  const [cookieCsrf, setCookieCsrf] = useState('');
  const [showAuthNeed, setShowAuthNeed] = useState(false);

  // ─── Anti-cheat: tab-switch tracking ───────────────────────────
  const [tabWarning, setTabWarning] = useState(false);   // show yellow banner
  const tabSwitchCount = useRef(0);

  const editorRef = useRef(null);
  const timerRef = useRef(null);
  const langRef = useRef(language);
  const codeRef = useRef(code);

  // cookies are ready when both keys exist in localStorage
  // useState so it updates immediately when saveSettings() is called mid-match
  const [cookiesReady, setCookiesReady] = useState(
    !!(localStorage.getItem('lc_session') && localStorage.getItem('lc_csrf'))
  );

  useEffect(() => { langRef.current = language; }, [language]);
  useEffect(() => { codeRef.current = code; }, [code]);

  // ─── Tab-switch anti-cheat ──────────────────────────────────────
  useEffect(() => {
    if (!cookiesReady || gameOver) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCount.current += 1;

        if (tabSwitchCount.current === 1) {
          // First switch — warn only
          setTabWarning(true);
        } else if (tabSwitchCount.current >= 2) {
          // Second switch — forfeit
          setTabWarning(false);
          if (socket) socket.emit('leave-match');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [cookiesReady, gameOver, socket]);

  // ─── Fetch Problem ──────────────────────────────────────────────
  useEffect(() => {
    const slug = sessionStorage.getItem('problemSlug');
    if (!slug) { setProblemLoading(false); return; }
    fetch(`/api/problem/${slug}`)
      .then(r => r.json())
      .then(data => {
        setProblem(data);
        const snippet = (data.codeSnippets || []).find(s => s.langSlug === 'python3')
          || (data.codeSnippets || [])[0];
        if (snippet) {
          setCode(snippet.code);
          setLanguage(snippet.langSlug);
        }
        if (data.exampleTestcases && data.exampleTestcases.length > 0) {
          setCustomInput(data.exampleTestcases.join('\n'));
        }
      })
      .catch(() => setProblem(null))
      .finally(() => setProblemLoading(false));
  }, []);

  // ─── Socket Events ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !roomCode) return;
    const playerName = sessionStorage.getItem('playerName') || 'Player';
    socket.emit('join-room', { code: roomCode, playerName, token });

    const onState = (state) => {
      setPlayers(state.players || []);
      if (state.startTime) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        setTimer(elapsed);
      }
    };
    const onUpdated = (list) => setPlayers(list);
    const onGameOver = (data) => {
      setGameOver(data);
      clearInterval(timerRef.current);
    };

    socket.on('room-state', onState);
    socket.on('players-updated', onUpdated);
    socket.on('game-over', onGameOver);

    return () => {
      socket.off('room-state', onState);
      socket.off('players-updated', onUpdated);
      socket.off('game-over', onGameOver);
    };
  }, [socket, roomCode, token]);

  // ─── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // ─── Run Code ───────────────────────────────────────────────────
  const handleRun = async () => {
    if (!token) {
      setShowAuthNeed(true);
      return;
    }
    setRunning(true);
    setActiveTab('output');
    setOutput('Running code...\n');
    try {
      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeRef.current,
          language: langRef.current,
          stdin: customInput,
          problemSlug: problem?.slug,
          questionId: problem?.id,
          sessionCookie: localStorage.getItem('lc_session'),
          csrfToken: localStorage.getItem('lc_csrf'),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setOutput(`Error: ${data.error || 'Unknown error'}`); return; }

      let outputStr = '';
      if (data.stderr) outputStr += `⚠️ Stderr:\n${data.stderr}\n\n`;
      if (data.stdout) outputStr += `Output:\n${data.stdout}`;
      if (data.code_answer) outputStr += `\nResult: ${data.code_answer.join(', ')}`;
      if (data.expected_code_answer) outputStr += `\nExpected: ${data.expected_code_answer.join(', ')}`;
      if (!data.stdout && !data.stderr && !data.code_answer) outputStr = 'No output produced.';

      setOutput(outputStr);
    } catch {
      setOutput('Failed to run code. Server error.');
    } finally {
      setRunning(false);
    }
  };

  // ─── Submit (Finish / i-finished) ───────────────────────────────
  const handleSubmit = async () => {
    if (!token) {
      setShowAuthNeed(true);
      return;
    }
    if (!problem) return;
    const sessionCookie = localStorage.getItem('lc_session');
    const csrfToken = localStorage.getItem('lc_csrf');

    if (!sessionCookie || !csrfToken) {
      setCookieSession(sessionCookie || '');
      setCookieCsrf(csrfToken || '');
      setShowSettings(true);
      return;
    }

    setSubmitting(true);
    setActiveTab('output');
    setOutput('Submitting to LeetCode (may take up to 15s)...\n');

    try {
      const res = await fetch('/api/submit-leetcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeRef.current,
          langSlug: langRef.current,
          questionId: problem.id,
          problemSlug: problem.slug,
          sessionCookie,
          csrfToken,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        let errStr = `Submission failed:\n${data.error || 'Unknown error'}`;
        if (data.error && data.error.includes('403 Forbidden')) {
          errStr += '\n\nPlease update your session cookies in Settings.';
          localStorage.removeItem('lc_session');
          localStorage.removeItem('lc_csrf');
        }
        setOutput(errStr);
        setSubmitting(false);
        return;
      }

      let outputStr = '';
      
      if (data.status_msg === 'Accepted') {
        outputStr += `✓ Accepted!\n`;
        outputStr += `Runtime: ${data.status_runtime || 'N/A'} (Beats ${data.runtime_percentile || 0}%)\n`;
        outputStr += `Memory: ${data.status_memory || 'N/A'} (Beats ${data.memory_percentile || 0}%)\n`;
        outputStr += `Passed ${data.total_correct} / ${data.total_testcases} testcases\n\n`;
        outputStr += `Marking as finished...`;
        
        if (socket && !gameOver) {
          setSubmissions(s => {
            const newCount = s + 1;
            socket.emit('i-finished', { submissions: newCount });
            return newCount;
          });
        }
      } else if (data.status_msg === 'Wrong Answer') {
        outputStr += `✗ Wrong Answer\n`;
        outputStr += `Passed ${data.total_correct} / ${data.total_testcases} testcases\n\n`;
        outputStr += `Input:\n${data.last_testcase?.replace(/\n/g, ' ')}\n\n`;
        outputStr += `Output:\n${data.code_output}\n\n`;
        outputStr += `Expected:\n${data.expected_output}\n`;
      } else if (data.status_msg === 'Compile Error') {
        outputStr += `Compile Error:\n${data.compile_error || data.full_error_msg}\n`;
      } else if (data.status_msg === 'Runtime Error') {
        outputStr += `Runtime Error:\n${data.runtime_error || data.full_error_msg}\n`;
      } else {
        outputStr += `${data.status_msg}\n`;
      }

      setOutput(outputStr);
    } catch {
      setOutput('Failed to submit. Network or server error.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('lc_session', cookieSession.trim());
    localStorage.setItem('lc_csrf', cookieCsrf.trim());
    setShowSettings(false);
    // unlock editor immediately after saving
    if (cookieSession.trim() && cookieCsrf.trim()) {
      setCookiesReady(true);
    }
  };

  // ─── Language Change ────────────────────────────────────────────
  const handleLangChange = (newLang) => {
    setLanguage(newLang);
    if (problem) {
      const snippet = (problem.codeSnippets || []).find(s => s.langSlug === newLang);
      if (snippet) setCode(snippet.code);
    }
  };

  const handleEditorMount = (editor) => { editorRef.current = editor; };

  const resetCode = () => {
    if (problem) {
      const snippet = (problem.codeSnippets || []).find(s => s.langSlug === language);
      if (snippet) setCode(snippet.code);
    }
  };

  const diffColor = problem?.difficulty === 'Easy' ? 'text-mint' : problem?.difficulty === 'Medium' ? 'text-gold' : 'text-flame';

  let maxTime = 30 * 60;
  if (problem?.difficulty === 'Easy') maxTime = 15 * 60;
  else if (problem?.difficulty === 'Hard') maxTime = 45 * 60;
  const timeLeft = Math.max(0, maxTime - timer);

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      {/* Top Bar */}
      <div className="h-11 bg-surface border-b border-border flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-bold tracking-tight text-ember">
            EleeteBattle
          </span>
          <div className="w-px h-4 bg-border" />
          <span className="text-xs font-medium text-muted font-mono">Room {roomCode}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Leave the battle? You will forfeit this match.')) {
                if (socket) socket.emit('leave-match');
                navigate('/');
              }
            }}
            className="px-2.5 py-1 bg-flame/[0.06] text-flame hover:bg-flame hover:text-white border border-flame/15 transition-all rounded-md text-xs font-medium cursor-pointer"
          >
            ← Leave
          </button>
          <button 
            onClick={() => {
              setCookieSession(localStorage.getItem('lc_session') || '');
              setCookieCsrf(localStorage.getItem('lc_csrf') || '');
              setShowSettings(true);
            }} 
            className="text-muted hover:text-text transition-colors bg-transparent border-none cursor-pointer p-1.5 rounded-md hover:bg-surface2"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <span className={`px-2.5 py-1 bg-surface2 border border-border rounded-full text-xs font-semibold font-mono ${timeLeft <= 60 && timer > 0 ? 'text-flame animate-pulse' : 'text-text2'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Problem Panel */}
        <div className="w-[400px] max-[768px]:hidden border-r border-border overflow-y-auto flex-shrink-0 bg-surface/50 p-6">
          {problemLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted">
              <div className="w-8 h-8 border-2 border-border border-t-ember rounded-full animate-spin" />
              <span className="text-sm">Loading problem...</span>
            </div>
          ) : problem ? (
            <>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="font-display text-lg font-bold tracking-tight text-text">{problem.title}</div>
              </div>
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <span className={`text-xs font-semibold ${diffColor}`}>{problem.difficulty}</span>
                {(problem.tags || []).slice(0, 4).map(t => (
                  <span key={t.slug} className="bg-surface2 border border-border rounded-full px-2 py-0.5 text-[0.65rem] font-medium text-muted transition-all hover:border-ember/20 hover:text-text2">
                    {t.name}
                  </span>
                ))}
              </div>
              <div className="problem-body" dangerouslySetInnerHTML={{ __html: problem.content }} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
              <div className="text-3xl">📝</div>
              <div className="text-base font-semibold text-text">Problem not loaded</div>
              <div className="text-muted text-sm max-w-[340px] leading-relaxed">Open the LeetCode link in a new tab to view the problem description.</div>
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="h-10 bg-surface border-b border-border flex items-center px-3 gap-2 flex-shrink-0">
            <select value={language} onChange={e => handleLangChange(e.target.value)}
              className="bg-surface2 border border-border text-text text-xs font-mono rounded-md py-1 px-2 outline-none cursor-pointer hover:border-ember/30 transition-all">
              {Object.entries(LANG_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <div className="flex-1" />
            <button onClick={resetCode} className="text-muted text-xs bg-transparent border border-border rounded-md py-1 px-2.5 cursor-pointer hover:text-text hover:border-text2/20 transition-all">
              ↩ Reset
            </button>
            <button onClick={handleRun} disabled={running}
              className="text-mint text-xs bg-mint/[0.06] border border-mint/15 rounded-md py-1 px-3 cursor-pointer font-medium hover:bg-mint/[0.12] transition-all disabled:opacity-50">
              {running ? 'Running...' : '▶ Run'}
            </button>
            <button onClick={handleSubmit} disabled={submitting || !!gameOver}
              className="text-white text-xs bg-ember hover:bg-ember-glow border-none rounded-md py-1 px-3 cursor-pointer font-semibold shadow-[0_2px_8px_rgba(255,107,53,0.2)] transition-all disabled:opacity-50">
              {submitting ? 'Submitting...' : '🏆 Submit'}
            </button>
          </div>

          {/* Code Editor */}
          <div className="flex-1 min-h-0 relative">
            <Editor
              height="100%"
              language={LANG_CONFIG[language]?.monaco || 'python'}
              value={code}
              onChange={(val) => { if (cookiesReady) setCode(val || ''); }}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                tabSize: 4,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                readOnly: !cookiesReady,
              }}
            />

            {/* Lock overlay — shown when cookies not set */}
            {!cookiesReady && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
                style={{ background: 'rgba(12,12,15,0.82)', backdropFilter: 'blur(4px)' }}
              >
                <div style={{ fontSize: '2rem' }}>🔒</div>
                <div style={{ color: '#ececf1', fontWeight: 700, fontSize: '0.95rem' }}>Editor Locked</div>
                <div style={{ color: '#a1a1aa', fontSize: '0.8rem', textAlign: 'center', maxWidth: '260px', lineHeight: 1.5 }}>
                  Sync your LeetCode cookies first to start coding.
                </div>
                <button
                  onClick={() => { setCookieSession(localStorage.getItem('lc_session') || ''); setCookieCsrf(localStorage.getItem('lc_csrf') || ''); setShowSettings(true); }}
                  style={{
                    marginTop: '4px', padding: '8px 20px', borderRadius: '8px',
                    background: '#ff6b35', color: '#fff', fontWeight: 700,
                    fontSize: '0.82rem', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(255,107,53,0.3)',
                  }}
                >
                  ⚙ Open Settings
                </button>
              </div>
            )}

            {/* Tab-switch warning banner — shown after first switch */}
            {tabWarning && cookiesReady && (
              <div
                className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 z-20"
                style={{
                  background: 'rgba(245,158,11,0.12)',
                  borderBottom: '1px solid rgba(245,158,11,0.35)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>⚠️</span>
                  <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.82rem' }}>
                    Warning: Tab switch detected.
                  </span>
                  <span style={{ color: '#a1a1aa', fontSize: '0.78rem' }}>
                    Switching tabs again will forfeit the match.
                  </span>
                </div>
                <button
                  onClick={() => setTabWarning(false)}
                  style={{ background: 'none', border: 'none', color: '#63636e', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="h-44 border-t border-border bg-surface/60 flex flex-col flex-shrink-0">
            <div className="flex items-center border-b border-border">
              <button onClick={() => setActiveTab('output')}
                className={`px-4 py-2 text-xs font-medium border-none cursor-pointer transition-all ${activeTab === 'output' ? 'text-ember bg-ember/[0.05] border-b-2 border-b-ember' : 'text-muted bg-transparent hover:text-text2'}`}>
                Output
              </button>
              <button onClick={() => setActiveTab('input')}
                className={`px-4 py-2 text-xs font-medium border-none cursor-pointer transition-all ${activeTab === 'input' ? 'text-ember bg-ember/[0.05] border-b-2 border-b-ember' : 'text-muted bg-transparent hover:text-text2'}`}>
                Custom Input
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {activeTab === 'output' ? (
                <pre className="font-mono text-xs text-text2 whitespace-pre-wrap leading-relaxed m-0">
                  {output || 'Run your code to see output here...'}
                </pre>
              ) : (
                <textarea
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="Enter custom test input..."
                  className="w-full h-full bg-transparent border-none text-text2 font-mono text-xs resize-none outline-none placeholder:text-muted/50"
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[220px] max-[560px]:hidden border-l border-border bg-surface p-4 flex flex-col gap-4 overflow-y-auto flex-shrink-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">Problem</div>
          {problem && (
            <div className="bg-surface2 border border-border rounded-md p-2.5 text-xs leading-relaxed break-all">
              <a href={`https://leetcode.com/problems/${problem.slug}/`} target="_blank" rel="noopener noreferrer" className="text-ember no-underline hover:underline">
                leetcode.com/problems/{problem.slug}
              </a>
            </div>
          )}

          <div className="text-xs font-medium uppercase tracking-wider text-muted mt-1">Players</div>
          {players.map(p => (
            <div key={p.id} className={`bg-surface2 border rounded-md p-2.5 text-sm flex items-center justify-between transition-all ${p.id === socket?.id ? 'border-ember/30' : 'border-border'}`}>
              <span className="font-medium text-text">{p.name}</span>
              {p.id === socket?.id && <span className="text-[0.6rem] text-ember font-mono font-semibold">YOU</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-bg/90 backdrop-blur-lg flex items-center justify-center z-[1000] animate-fadeIn">
          <div className="relative bg-surface border border-border rounded-lg p-7 w-full max-w-[420px] shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-popIn text-left">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ember/60 to-ember/10 rounded-t-lg" />
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-display text-lg font-bold text-text">LeetCode Settings</h2>
              <button onClick={() => setShowSettings(false)} className="bg-transparent border-none text-muted cursor-pointer text-lg hover:text-text transition-colors">✕</button>
            </div>
            <p className="text-text2 text-sm mb-5 leading-relaxed">
              <strong className="text-ember">Tip:</strong> Use the Auto-Sync Extension to automatically inject your cookies.
              Otherwise, paste them from your LeetCode session (Dev Tools → Application tab).
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-text2 mb-1.5">LEETCODE_SESSION</label>
              <input type="text" value={cookieSession} onChange={e => setCookieSession(e.target.value)} placeholder="Paste LEETCODE_SESSION here..."
                className="w-full bg-surface2 border border-border rounded-md p-2.5 text-text text-sm transition-all outline-none focus:border-ember/50 focus:ring-1 focus:ring-ember/20" />
            </div>
            <div className="mb-5">
              <label className="block text-xs font-medium text-text2 mb-1.5">csrftoken</label>
              <input type="text" value={cookieCsrf} onChange={e => setCookieCsrf(e.target.value)} placeholder="Paste csrftoken here..."
                className="w-full bg-surface2 border border-border rounded-md p-2.5 text-text text-sm transition-all outline-none focus:border-ember/50 focus:ring-1 focus:ring-ember/20" />
            </div>
            <button onClick={saveSettings}
              className="w-full py-2.5 bg-ember hover:bg-ember-glow text-white font-semibold rounded-md border-none cursor-pointer shadow-[0_4px_16px_rgba(255,107,53,0.2)] transition-all text-sm">
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Auth Need Modal */}
      {showAuthNeed && (
        <div className="fixed inset-0 bg-bg/90 backdrop-blur-lg flex items-center justify-center z-[1000] animate-fadeIn">
          <div className="relative bg-surface border border-border rounded-lg p-8 w-full max-w-[380px] shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-popIn text-center flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ember/60 to-ember/10 rounded-t-lg" />
            <div className="text-3xl mb-3 mt-1">🔒</div>
            <h2 className="font-display text-lg font-bold text-text mb-2">Sign in required</h2>
            <p className="text-text2 text-sm mb-6 leading-relaxed">
              You need to log in or create an account to run and submit code.
            </p>
            <div className="flex gap-3 w-full justify-center">
              <button onClick={() => navigate('/login')} className="flex-1 max-w-[130px] py-2 bg-surface2 border border-border text-text font-medium rounded-md cursor-pointer hover:border-ember/30 hover:text-ember transition-all text-sm">Log in</button>
              <button onClick={() => navigate('/register')} className="flex-1 max-w-[130px] py-2 bg-ember hover:bg-ember-glow text-white font-semibold rounded-md border-none cursor-pointer shadow-[0_4px_12px_rgba(255,107,53,0.2)] transition-all text-sm">Sign up</button>
            </div>
            <button onClick={() => setShowAuthNeed(false)} className="mt-4 text-muted text-xs bg-transparent border-none cursor-pointer hover:text-text transition-all">Continue as guest (view only)</button>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      <GameOverOverlay data={gameOver} mySocketId={socket?.id} />
    </div>
  );
}
