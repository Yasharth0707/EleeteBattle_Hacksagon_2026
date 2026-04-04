const { extractSlug, generateCode } = require('../utils/helpers');
const { getArena } = require('./rating.service');
const { fetchProblem, getRandomProblemSlug } = require('./leetcode.service');

// ─── In-memory matchmaking queue ─────────────────────────────────────────────
const matchmakingQueue = [];

/**
 * Remove a player from the matchmaking queue by socket ID.
 */
function removeFromQueue(socketId) {
  const idx = matchmakingQueue.findIndex(e => e.socketId === socketId);
  if (idx !== -1) matchmakingQueue.splice(idx, 1);
}

/**
 * Try to match two compatible players in the queue.
 */
async function tryMatchPlayers(io, rooms) {
  if (matchmakingQueue.length < 2) return;

  let p1Index = -1;
  let p2Index = -1;

  for (let i = 0; i < matchmakingQueue.length; i++) {
    for (let j = i + 1; j < matchmakingQueue.length; j++) {
      const p1 = matchmakingQueue[i];
      const p2 = matchmakingQueue[j];

      const arena1 = getArena(p1.rating || 1000);
      const arena2 = getArena(p2.rating || 1000);

      let isMatch = false;

      if (arena1 === arena2) {
        if (p1.questionType === 'random' && p2.questionType === 'random' && p1.difficulty === p2.difficulty) {
          isMatch = true;
        } else if (p1.questionType === 'manual' && p2.questionType === 'manual' && p1.problemUrl === p2.problemUrl) {
          isMatch = true;
        }
      }

      if (isMatch) {
        p1Index = i;
        p2Index = j;
        break;
      }
    }
    if (p1Index !== -1) break;
  }

  if (p1Index === -1) return;

  const player2 = matchmakingQueue.splice(Math.max(p1Index, p2Index), 1)[0];
  const player1 = matchmakingQueue.splice(Math.min(p1Index, p2Index), 1)[0];

  let problemSlug = null;
  let problemUrl = null;

  if (player1.problemUrl) {
    problemSlug = extractSlug(player1.problemUrl);
    problemUrl = player1.problemUrl;
  } else if (player2.problemUrl) {
    problemSlug = extractSlug(player2.problemUrl);
    problemUrl = player2.problemUrl;
  } else {
    const diffPriority = { hard: 3, medium: 2, easy: 1 };
    const diff1 = player1.difficulty || 'easy';
    const diff2 = player2.difficulty || 'easy';
    const chosenDiff = (diffPriority[diff1] || 1) >= (diffPriority[diff2] || 1) ? diff1 : diff2;

    try {
      problemSlug = await getRandomProblemSlug(chosenDiff);
      problemUrl = `https://leetcode.com/problems/${problemSlug}/`;
    } catch (err) {
      console.error('Failed to get random problem for matchmaking:', err.message);
      matchmakingQueue.unshift(player1, player2);
      return;
    }
  }

  try {
    await fetchProblem(problemSlug);
  } catch (err) {
    console.error('Failed to validate problem for matchmaking:', err.message);
    matchmakingQueue.unshift(player1, player2);
    return;
  }

  let roomCode;
  do { roomCode = generateCode(); } while (rooms[roomCode]);

  rooms[roomCode] = {
    code: roomCode,
    problemUrl,
    problemSlug,
    players: {},
    hostId: null,
    started: false,
    winner: null,
    startTime: null,
    createdAt: Date.now()
  };

  console.log(`⚔️  Match found! ${player1.playerName} vs ${player2.playerName} → Room ${roomCode} (${problemSlug})`);

  const s1 = io.sockets.sockets.get(player1.socketId);
  const s2 = io.sockets.sockets.get(player2.socketId);

  if (s1) {
    s1.emit('match-found', {
      roomCode,
      opponentName: player2.playerName,
      problemUrl,
      problemSlug
    });
  }

  if (s2) {
    s2.emit('match-found', {
      roomCode,
      opponentName: player1.playerName,
      problemUrl,
      problemSlug
    });
  }
}

module.exports = {
  matchmakingQueue,
  removeFromQueue,
  tryMatchPlayers,
};
