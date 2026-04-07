const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

const { PORT } = require('./src/config/env');
const connectDB = require('./src/config/db');
const { loadRuntimes } = require('./src/services/piston.service');
const { initializeSocket } = require('./src/sockets/gameSocket');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const problemRoutes = require('./src/routes/problem.routes');
const leaderboardRoutes = require('./src/routes/leaderboard.routes');
const executionRoutes = require('./src/routes/execution.routes');
const { router: roomRoutes, setRooms } = require('./src/routes/room.routes');

// ─── Initialize ──────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ─── Shared in-memory state ──────────────────────────────────────────────────
const rooms = {};
setRooms(rooms);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api', problemRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api', executionRoutes);
app.use('/', roomRoutes);

// ─── Serve Frontend (Production) ─────────────────────────────────────────────
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// ─── Socket.io ───────────────────────────────────────────────────────────────
initializeSocket(io, rooms);

// ─── Stale Room Cleanup ──────────────────────────────────────────────────────
setInterval(() => {
  const now = Date.now();
  for (const code in rooms) {
    if (now - rooms[code].createdAt > 2 * 60 * 60 * 1000) delete rooms[code];
  }
}, 60 * 60 * 1000);

// ─── Start Server ────────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  await loadRuntimes();

  server.listen(PORT, () => {
    console.log(`\n⚡ EleeteBattle server running on port ${PORT}`);
    console.log(`   http://localhost:${PORT}\n`);
  });
}

start();
