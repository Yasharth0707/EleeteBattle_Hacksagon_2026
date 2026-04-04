const express = require('express');
const { isValidLeetCodeUrl, extractSlug, generateCode } = require('../utils/helpers');
const { fetchProblem } = require('../services/leetcode.service');

const router = express.Router();

// Shared rooms object — injected via factory
let rooms = {};

function setRooms(r) { rooms = r; }

// POST /create-room
router.post('/create-room', async (req, res) => {
  const { problemUrl } = req.body;
  if (!problemUrl || !isValidLeetCodeUrl(problemUrl)) {
    return res.status(400).json({ error: 'Invalid LeetCode problem URL.' });
  }

  const slug = extractSlug(problemUrl);

  try {
    await fetchProblem(slug);
  } catch {
    return res.status(400).json({ error: 'Could not fetch that problem from LeetCode. Check the URL.' });
  }

  let code;
  do { code = generateCode(); } while (rooms[code]);

  rooms[code] = {
    code,
    problemUrl,
    problemSlug: slug,
    players: {},
    hostId: null,
    started: false,
    winner: null,
    startTime: null,
    createdAt: Date.now()
  };

  res.json({ code, problemUrl, slug });
});

// POST /join-room
router.post('/join-room', (req, res) => {
  const { code } = req.body;
  const room = rooms[code?.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found. Check the code and try again.' });
  if (room.started) return res.status(400).json({ error: 'Battle already started.' });
  const playerCount = Object.keys(room.players).length;
  if (playerCount >= 2) return res.status(400).json({ error: 'Room is full.' });

  res.json({ code: room.code, problemUrl: room.problemUrl, slug: room.problemSlug });
});

module.exports = { router, setRooms };
