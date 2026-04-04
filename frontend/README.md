# EleeteBattle_Hacksagon_2026
# Hacksagon

Hey! This is our project for the Hacksagon hackathon. We're building **EleeteBattle** — a real-time 1v1 competitive coding duel platform. Think LeetCode meets Clash Royale. Two players get matched, they race to solve the same problem, and the winner's rating goes up.

## The Problem

LeetCode is amazing for practice, but doing it alone gets boring after a while. There's no pressure, no stakes, no reason to push yourself. We wanted to change that by turning coding practice into an actual competitive game.

## Tech Stack

| Layer | What we're using |
|-------|-----------------|
| **Frontend** | React, Vite, Tailwind CSS, Monaco Editor |
| **Backend** | Node.js, Express |
| **Database** | MongoDB Atlas (Mongoose) |
| **Real-time** | Socket.io |
| **Code Execution** | Piston API + LeetCode GraphQL API |
| **Auth** | JWT + bcrypt |

## Features We've Built

### 🔐 Authentication
- Register/Login with hashed passwords (bcrypt)
- JWT-based session tokens that last 7 days
- Protected routes on both frontend and backend

### ⚔️ Real-Time 1v1 Matchmaking
- Players queue up and get matched by difficulty preference
- Matchmaking happens over WebSockets (Socket.io) — instant pairing
- Both players receive the same random problem and race to solve it

### 💻 Code Editor
- Full Monaco Editor (same engine as VS Code) embedded in the browser
- Multi-language support — Python, JavaScript, C++, Java, and more
- Syntax highlighting, auto-completion, the works

### 🧪 Dual Code Execution Engine
- **Primary:** LeetCode's native interpreter for real verdicts (Accepted, Wrong Answer, etc.)
- **Fallback:** Piston API — open-source sandboxed code runner supporting 50+ languages
- Automatic failover between the two

### 📊 Elo Rating System
- Chess-style Elo rating that factors in problem difficulty, solve speed, and submission count
- Beating a higher-rated opponent gives bonus points
- Every player starts at 1000 rating

### 👤 Player Profiles
- Full match history with opponent names, ratings, problems solved
- Rating progression chart over time
- Win/loss record tracking

### 🏆 Leaderboard
- Global rankings sorted by Elo rating
- Top 50 players displayed with their stats

### 🚀 Private Rooms
- Create custom lobbies with a specific LeetCode problem
- Share a 6-character invite code with a friend
- Both players ready up, then battle begins

## Project Structure

```
Eleete_battle-main/
├── backend/
│   ├── server.js                  # Entry point — Express + Socket.io
│   └── src/
│       ├── config/
│       │   ├── env.js             # Environment variable parsing  
│       │   └── db.js              # MongoDB connection
│       ├── models/
│       │   └── User.js            # User schema (rating, match history)
│       ├── middleware/
│       │   └── auth.js            # JWT verification middleware
│       ├── routes/
│       │   ├── auth.routes.js     # Register, Login, Profile
│       │   ├── problem.routes.js  # Fetch problems from LeetCode
│       │   ├── execution.routes.js# Run code & submit solutions
│       │   ├── leaderboard.routes.js  # Top players
│       │   └── room.routes.js     # Create/join private rooms
│       ├── services/
│       │   ├── piston.service.js      # Piston code execution
│       │   ├── leetcode.service.js    # LeetCode GraphQL scraper
│       │   ├── rating.service.js      # Elo calculations
│       │   └── matchmaking.service.js # Player pairing logic
│       ├── sockets/
│       │   └── gameSocket.js      # All real-time event handlers
│       └── utils/
│           └── helpers.js         # Room codes, slug parsing, etc.
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Router setup  
│   │   ├── main.jsx               # React entry point
│   │   ├── index.css              # Global styles
│   │   ├── pages/
│   │   │   ├── Landing.jsx        # Home page
│   │   │   ├── Login.jsx          # Login form
│   │   │   ├── Register.jsx       # Registration form
│   │   │   ├── Matchmaking.jsx    # Quick match queue UI
│   │   │   ├── Battle.jsx         # Code editor + problem view
│   │   │   ├── Room.jsx           # Private room lobby
│   │   │   ├── Invite.jsx         # Create room page
│   │   │   ├── Join.jsx           # Join room page
│   │   │   ├── Profile.jsx        # Player stats & match history
│   │   │   └── Leaderboard.jsx    # Global rankings
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   ├── GameOverOverlay.jsx# Win/lose modal
│   │   │   ├── ParticleBackground.jsx # Animated background
│   │   │   └── ProtectedRoute.jsx # Auth route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # JWT auth state management
│   │   │   └── SocketContext.jsx  # Socket.io connection provider
│   │   ├── hooks/
│   │   │   ├── useAuth.js         # Auth context hook
│   │   │   └── useSocket.js       # Socket context hook    
│   │   └── lib/
│   │       └── utils.js           # Frontend utility functions
│   └── package.json
│
└── README.md
```

## Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/your-username/EleeteBattle_Hacksagon_2026.git
cd EleeteBattle_Hacksagon_2026
```

### 2. Backend Setup
Create a `.env` file inside the `backend` folder (check `.env.example` for reference):
```env
PORT=3000
JWT_SECRET=your_secret_key_here
DB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
NODE_ENV=development
```

Then install and run:
```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ Connected to MongoDB database.
✅ Loaded XX Piston runtimes for code execution.
⚡ EleeteBattle server running on port 3000
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be live at `http://localhost:5173`.

## API Endpoints

### Auth
| Method | Endpoint | What it does |
|--------|----------|-------------|
| POST | `/api/register` | Register a new player |
| POST | `/api/login` | Login and get JWT token |
| GET | `/api/me` | Get current user's profile |

### Problems & Execution
| Method | Endpoint | What it does |
|--------|----------|-------------|
| GET | `/api/problem/:slug` | Fetch a specific problem |
| GET | `/api/random-problem?difficulty=easy` | Get a random problem |
| POST | `/api/run-code` | Execute code (sandbox) |
| POST | `/api/submit-leetcode` | Submit for full evaluation |

### Social
| Method | Endpoint | What it does |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Top 50 players by rating |
| POST | `/create-room` | Create a private room |
| POST | `/join-room` | Join a room via code |

## Socket Events

| Event | Direction | What it does |
|-------|-----------|-------------|
| `join-queue` | Client → Server | Join the matchmaking queue |
| `leave-queue` | Client → Server | Leave the queue |
| `match-found` | Server → Client | You've been paired with someone |
| `join-room` | Client → Server | Connect to a game room |
| `player-ready` | Client → Server | Toggle ready status |
| `battle-start` | Server → Client | Both ready — game begins |
| `i-finished` | Client → Server | Player solved the problem |
| `game-over` | Server → Client | Match result + rating changes |
| `leave-match` | Client → Server | Forfeit or leave |

---
*Built with sleep deprivation and energy drinks at Hacksagon 2026 ⚡*
