// ─── Piston Runtimes ─────────────────────────────────────────────────────────
let pistonRuntimes = [];

/**
 * Load available Piston runtimes on startup.
 */
async function loadRuntimes() {
  try {
    const res = await fetch('https://emkc.org/api/v2/piston/runtimes');
    const data = await res.json();
    pistonRuntimes = data;
    console.log(`✅ Loaded ${data.length} Piston runtimes for code execution.`);
  } catch (err) {
    console.error('Failed to load Piston runtimes:', err.message);
  }
}

/**
 * Execute code using the Piston API.
 * @returns {{ stdout, stderr, exitCode, status, time, memory }}
 */
async function executeCode(code, language, stdin = '') {
  let pistLang = language.toLowerCase();
  if (pistLang === 'python3') pistLang = 'python';
  if (pistLang === 'cpp' || pistLang === 'c++') pistLang = 'c++';

  const runtime = pistonRuntimes.find(r => r.language === pistLang || r.aliases.includes(pistLang));
  if (!runtime) {
    throw new Error(`Unsupported or pending language config: ${language}`);
  }

  const submitRes = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: runtime.language,
      version: runtime.version,
      files: [{ content: code }],
      stdin: stdin || ''
    })
  });

  if (!submitRes.ok) {
    const text = await submitRes.text();
    throw new Error(`Piston code execution failed: ${text}`);
  }

  const result = await submitRes.json();
  const stderr = result.run?.stderr || result.compile?.stderr || '';
  const stdout = result.run?.stdout || '';

  return {
    stdout,
    stderr,
    exitCode: result.run?.code ?? -1,
    status: result.run?.code === 0 ? 'Accepted' : 'Runtime Error',
    time: '0.01', // Placeholder stats
    memory: 0
  };
}

module.exports = {
  loadRuntimes,
  executeCode,
};
