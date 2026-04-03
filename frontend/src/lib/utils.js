export function getArena(rating) {
  if (rating < 1400) return { name: 'Bronze', color: '#cd7f32' };
  if (rating < 1800) return { name: 'Silver', color: '#94a3b8' };
  if (rating < 2200) return { name: 'Gold', color: '#f59e0b' };
  if (rating < 2600) return { name: 'Diamond', color: '#6c9fff' };
  if (rating < 3000) return { name: 'Master', color: '#8b5cf6' };
  return { name: 'Grand Champion', color: '#ff6b35' };
}

export function escHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

export function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export const LANG_CONFIG = {
  'python3':    { piston: 'python3',    monaco: 'python',     label: 'Python 3' },
  'javascript': { piston: 'javascript', monaco: 'javascript', label: 'JavaScript' },
  'typescript': { piston: 'typescript', monaco: 'typescript', label: 'TypeScript' },
  'java':       { piston: 'java',       monaco: 'java',       label: 'Java' },
  'cpp':        { piston: 'cpp',        monaco: 'cpp',        label: 'C++' },
  'c':          { piston: 'c',          monaco: 'c',          label: 'C' },
  'csharp':     { piston: 'csharp',     monaco: 'csharp',     label: 'C#' },
  'golang':     { piston: 'go',         monaco: 'go',         label: 'Go' },
  'rust':       { piston: 'rust',       monaco: 'rust',       label: 'Rust' },
  'ruby':       { piston: 'ruby',       monaco: 'ruby',       label: 'Ruby' },
  'swift':      { piston: 'swift',      monaco: 'swift',      label: 'Swift' },
  'kotlin':     { piston: 'kotlin',     monaco: 'kotlin',     label: 'Kotlin' },
  'php':        { piston: 'php',        monaco: 'php',        label: 'PHP' },
};