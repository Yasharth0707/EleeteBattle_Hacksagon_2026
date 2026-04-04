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
    // ── I Finished ─────────────────────────────────────────────────
    socket.on('i-finished', (payload) => {
      const code = socket.data.roomCode;
      const submissions = payload?.submissions || 1;
      const room = rooms[code];
      console.log(`[DEBUG] 'i-finished' received from socket ${socket.id} in room ${code}`);
      if (!room) {
        console.log(`[DEBUG] Room not found.`);
        return;
      }
      if (!room.started) {
        console.log(`[DEBUG] Room ${code} not started yet.`);
        room.startTime = room.createdAt || Date.now();
        room.started = true;
      }
      if (room.winner) {
        console.log(`[DEBUG] Room ${code} already has a winner (${room.winner}).`);
        return;
      }

      room.winner = socket.id;
      const winnerPlayer = room.players[socket.id];
      const winnerName = winnerPlayer?.name || 'Unknown';
      const winnerUserId = winnerPlayer?.userId;
      const elapsed = Math.floor((Date.now() - room.startTime) / 1000);

      // Find loser
      let loserId = null;
      let loserUserId = null;
      let loserName = 'Unknown';
      for (const [sid, p] of Object.entries(room.players)) {
        if (sid !== socket.id) {
          loserId = sid;
          loserUserId = p.userId;
          loserName = p.name || 'Unknown';
          break;
        }
      }

      const notifyGameOver = (ratingChangeWinner = 0, ratingChangeLoser = 0, winnerNewRating = 1000, loserNewRating = 1000) => {
        io.to(code).emit('game-over', {
          winnerId: socket.id,
          loserId,
          winnerName,
          elapsedSeconds: elapsed,
          ratingChangeWinner,
          ratingChangeLoser,
          winnerNewRating,
          loserNewRating,
          isRated: !!(winnerUserId && loserUserId)
        });
      };

      const recordUnratedMatches = async () => {
        try {
          const problemData = problemCache[room.problemSlug] || {};
          const pTitle = problemData.title || room.problemSlug || 'Custom Problem';
          const pDiff = problemData.difficulty || 'Medium';

          if (winnerUserId) {
            const rowW = await User.findById(winnerUserId);
            if (rowW) {
              rowW.matchHistory.push({
                result: 'Win', ratingDelta: 0, newRating: rowW.rating,
                opponentName: loserName, opponentRating: 0,
                problemTitle: pTitle, problemSlug: room.problemSlug || '',
                difficulty: pDiff, timeTaken: elapsed, submissions: submissions,
                isRated: false, date: new Date()
              });
              await rowW.save();
            }
          }
          if (loserUserId) {
            const rowL = await User.findById(loserUserId);
            if (rowL) {
              rowL.matchHistory.push({
                result: 'Loss', ratingDelta: 0, newRating: rowL.rating,
                opponentName: winnerName, opponentRating: 0,
                problemTitle: pTitle, problemSlug: room.problemSlug || '',
                difficulty: pDiff, timeTaken: elapsed, submissions: 0,
                isRated: false, date: new Date()
              });
              await rowL.save();
            }
          }
        } catch (err) {
          console.error('Failed storing unrated history:', err);
        }
      };

      if (winnerUserId && loserUserId) {
        // dono registered user hai → Rated match
        (async () => {
          try {
            const rowW = await User.findById(winnerUserId);
            const rowL = await User.findById(loserUserId);
            if (!rowW || !rowL) {
              await recordUnratedMatches();
              return notifyGameOver();
            }

            const ratingW = rowW.rating;
            const ratingL = rowL.rating;

            const pSlug = room.problemSlug;
            const diffMap = { 'Easy': 'Easy', 'Medium': 'Medium', 'Hard': 'Hard' };
            let diffStr = 'Medium';
            let problemTitle = pSlug || 'Custom Problem';
            if (pSlug && problemCache[pSlug]) {
              diffStr = diffMap[problemCache[pSlug].difficulty] || 'Medium';
              problemTitle = problemCache[pSlug].title || problemTitle;
            }

            const resRating = calculateLogicalRating(ratingW, ratingL, diffStr, elapsed, submissions);
            const newRatingW = resRating.newRatingW;
            const newRatingL = resRating.newRatingL;

            const changeW = newRatingW - ratingW;
            const changeL = newRatingL - ratingL;

            rowW.rating = newRatingW;
            rowW.wins += 1;
            rowW.ratingHistory.push({ rating: newRatingW });
            rowW.matchHistory.push({
              result: 'Win', ratingDelta: changeW, newRating: newRatingW,
              opponentName: rowL.username, opponentRating: ratingL,
              problemTitle: problemTitle, problemSlug: pSlug || '',
              difficulty: diffStr, timeTaken: elapsed, submissions: submissions,
              isRated: true, date: new Date()
            });
            await rowW.save();

            rowL.rating = newRatingL;
            rowL.losses += 1;
            rowL.ratingHistory.push({ rating: newRatingL });
            rowL.matchHistory.push({
              result: 'Loss', ratingDelta: changeL, newRating: newRatingL,
              opponentName: rowW.username, opponentRating: ratingW,
              problemTitle: problemTitle, problemSlug: pSlug || '',
              difficulty: diffStr, timeTaken: elapsed, submissions: 0,
              isRated: true, date: new Date()
            });
            await rowL.save();

            notifyGameOver(changeW, changeL, newRatingW, newRatingL);
          } catch (err) {
            console.error('Failed to update ratings:', err);
            notifyGameOver();
          }
        })();
      } else {
        recordUnratedMatches()
          .then(() => notifyGameOver())
          .catch((err) => {
            console.error('Failed storing unrated history:', err);
            notifyGameOver();
          });
      }
    });

    // ── Matchmaking Queue ────────────────────────────────────────────
    socket.on('join-queue', ({ playerName, questionType, difficulty, problemUrl, token }) => {
      let userId = null;
      let rating = 1000;
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.id;
          playerName = decoded.username;
          rating = decoded.rating || 1000;
        } catch (e) { /* ignore */ }
      }

      removeFromQueue(socket.id);

      matchmakingQueue.push({
        socketId: socket.id,
        userId,
        playerName: playerName || 'Player',
        rating,
        questionType: questionType || 'random',
        difficulty: difficulty || 'easy',
        problemUrl: problemUrl || null,
        joinedAt: Date.now()
      });

      console.log(`🔍 ${playerName} joined matchmaking queue (${questionType}, ${difficulty || 'n/a'}). Queue size: ${matchmakingQueue.length}`);

      // Send queue status to everyone in queue
      matchmakingQueue.forEach(entry => {
        const s = io.sockets.sockets.get(entry.socketId);
        if (s) {
          s.emit('queue-status', {
            position: matchmakingQueue.indexOf(entry) + 1,
            total: matchmakingQueue.length
          });
        }
      });

      tryMatchPlayers(io, rooms);
    });

    socket.on('leave-queue', () => {
      removeFromQueue(socket.id);
      console.log(`❌ Player left matchmaking queue. Queue size: ${matchmakingQueue.length}`);
    });

    // ── Leave Match ──────────────────────────────────────────────────
    socket.on('leave-match', () => {
      const code = socket.data.roomCode;
      const room = rooms[code];
      if (!room) return;

      const playerName = room.players[socket.id]?.name;

      if (!room.started) {
        // Left lobby
        delete room.players[socket.id];
        const playerList = buildPlayerList(room);
        io.to(code).emit('players-updated', playerList);
        if (playerName) {
          io.to(code).emit('player-left', { name: playerName });
        }
      } else if (!room.winner) {
        // Forfeited match
        let winnerId = null;
        for (const sid of Object.keys(room.players)) {
          if (sid !== socket.id) {
            winnerId = sid;
            break;
          }
        }
        
        if (winnerId) {
          room.winner = winnerId;
          const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
          io.to(code).emit('game-over', {
            winnerId: winnerId,
            loserId: socket.id,
            winnerName: room.players[winnerId]?.name || 'Opponent',
            elapsedSeconds: elapsed,
            ratingChangeWinner: 0,
            ratingChangeLoser: 0,
            winnerNewRating: 1000,
            loserNewRating: 1000,
            isRated: false,
            forfeit: true
          });
        }
      }
      
      socket.leave(code);
      socket.data.roomCode = null;
    });

    // ── Disconnect ───────────────────────────────────────────────────
    socket.on('disconnect', () => {
      removeFromQueue(socket.id);

      const code = socket.data.roomCode;
      const room = rooms[code];
      if (!room) return;

      if (room.started && !room.winner) {
        // Disconnected mid-match -> Forfeit
        let winnerId = null;
        for (const sid of Object.keys(room.players)) {
          if (sid !== socket.id) {
            winnerId = sid;
            break;
          }
        }
        
        if (winnerId) {
          room.winner = winnerId;
          const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
          io.to(code).emit('game-over', {
            winnerId: winnerId,
            loserId: socket.id,
            winnerName: room.players[winnerId]?.name || 'Opponent',
            elapsedSeconds: elapsed,
            ratingChangeWinner: 0,
            ratingChangeLoser: 0,
            winnerNewRating: 1000,
            loserNewRating: 1000,
            isRated: false,
            forfeit: true
          });
        }
      }

      const playerName = room.players[socket.id]?.name;
      delete room.players[socket.id];

      const playerList = buildPlayerList(room);
      io.to(code).emit('players-updated', playerList);
      if (playerName) {
        io.to(code).emit('player-left', { name: playerName });
      }
    });
  });
}

module.exports = { initializeSocket };