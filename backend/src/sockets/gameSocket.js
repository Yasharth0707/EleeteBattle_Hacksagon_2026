const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { buildPlayerList } = require('../utils/helpers');
const { calculateLogicalRating } = require('../services/rating.service');
const { problemCache } = require('../services/leetcode.service');
const { matchmakingQueue, removeFromQueue, tryMatchPlayers } = require('../services/matchmaking.service');
const User = require('../models/User');

/**
 * Initialize all Socket.io event handlers.
 * @param {import('socket.io').Server} io
 * @param {Object} rooms - shared in-memory rooms object
 */
function initializeSocket(io, rooms) {
  io.on('connection', (socket) => {

    // ── Join Room ──────────────────────────────────────────────────
    socket.on('join-room', ({ code, playerName, token }) => {
      code = code?.toUpperCase();
      const room = rooms[code];
      if (!room) {
        socket.emit('error-msg', 'Room not found.');
        return;
      }

      let userId = null;
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.id;
          playerName = decoded.username;
        } catch (e) { /* ignore */ }
      }

      const playerCount = Object.keys(room.players).length;

      // After battle starts, allow reconnects
      if (room.started) {
        const connectedSockets = io.sockets.adapter.rooms.get(code) || new Set();
        for (const pid of Object.keys(room.players)) {
          if (!connectedSockets.has(pid) && pid !== socket.id) {
            delete room.players[pid];
          }
        }
      }

      const currentCount = Object.keys(room.players).length;

      if (currentCount === 0) {
        room.hostId = socket.id;
      } else if (currentCount >= 2 && !room.players[socket.id] && !room.started) {
        socket.emit('error-msg', 'Room is full.');
        return;
      }

      if (!room.players[socket.id]) {
        room.players[socket.id] = { name: playerName || `Player ${currentCount + 1}`, ready: false, userId };
      }

      socket.join(code);
      socket.data.roomCode = code;

      const playerList = buildPlayerList(room);
      socket.emit('room-state', {
        code,
        problemUrl: room.problemUrl,
        problemSlug: room.problemSlug,
        players: playerList,
        isHost: socket.id === room.hostId,
        started: room.started,
        startTime: room.startTime
      });

      io.to(code).emit('players-updated', playerList);
    });

    // ── Player Ready ───────────────────────────────────────────────
    socket.on('player-ready', () => {
      const code = socket.data.roomCode;
      const room = rooms[code];
      if (!room || room.started) return;

      const player = room.players[socket.id];
      if (!player) return;

      player.ready = !player.ready;

      const playerList = buildPlayerList(room);
      io.to(code).emit('players-updated', playerList);

      const allPlayers = Object.values(room.players);
      if (allPlayers.length === 2 && allPlayers.every(p => p.ready)) {
        room.started = true;
        room.startTime = Date.now();
        io.to(code).emit('battle-start', {
          startTime: room.startTime,
          problemUrl: room.problemUrl,
          problemSlug: room.problemSlug
        });
      }
    });