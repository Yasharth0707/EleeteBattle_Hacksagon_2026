/**
 * Generate a 6-character alphanumeric room code.
 */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/**
 * Extract the problem slug from a LeetCode URL.
 */
function extractSlug(url) {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/problems\/([^/]+)/);
    return match ? match[1].replace(/\/$/, '') : null;
  } catch {
    return null;
  }
}

/**
 * Validate that a URL is a LeetCode problem URL.
 */
function isValidLeetCodeUrl(url) {
  return !!extractSlug(url);
}

/**
 * Pick a random item from an array.
 */
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Build a serializable player list from room state.
 */
function buildPlayerList(room) {
  return Object.entries(room.players).map(([id, p]) => ({
    id,
    name: p.name,
    ready: p.ready,
    isHost: id === room.hostId
  }));
}

module.exports = {
  generateCode,
  extractSlug,
  isValidLeetCodeUrl,
  getRandomItem,
  buildPlayerList,
};
