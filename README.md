# EleeteBattle - Hacksagon 2026

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

```text
EleeteBattle_Hacksagon_2026/
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
│   │   ├── index.css              # Global styles
│   │   ├── pages/                 # React Pages (Landing, Battle, Profile, etc.)
│   │   ├── components/            # React Components
│   │   ├── context/               # Auth & Socket providers
│   │   ├── hooks/                 # Custom React hooks
│   │   └── lib/                   # Utility functions
│   └── package.json
│
├── eleetebattle-extension/        # Browser extension for the platform
└── README.md
```

## Setup Instructions

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **[Node.js](https://nodejs.org/)** (v18 or higher recommended)
- **[Git](https://git-scm.com/)**
- A **MongoDB** instance (local setup, or via hosted [MongoDB Atlas](https://www.mongodb.com/atlas/database))

### 1. Clone the repo
```bash
git clone https://github.com/your-username/EleeteBattle_Hacksagon_2026.git
cd EleeteBattle_Hacksagon_2026
```

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder (you can use `.env.example` as a template if available) and configure your environment variables:
   ```env
   PORT=3000
   JWT_SECRET=your_secret_key_here
   DB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/your-db-name?retryWrites=true&w=majority
   NODE_ENV=development
   ```
   *Note: Replace `<username>`, `<password>`, and `your-db-name` with your actual MongoDB credentials.*
4. Start the backend server:
   ```bash
   node server.js
   ```
   You should see success messages in your terminal indicating it successfully connected to MongoDB and the server is running on port 3000.

### 3. Frontend Setup
1. Open a **new, separate terminal** in the root project directory, then navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be live at `http://localhost:5173`. Make sure the backend terminal is also still running so the frontend can communicate with it!

### 4. Browser Extension Setup (Optional)
To use the EleeteBattle extension for an enhanced workflow:
1. Open Google Chrome, Edge, or any Chromium-based browser.
2. Navigate to your extensions page (by typing `chrome://extensions/` or `edge://extensions/` in the URL bar).
3. Enable **Developer mode** (usually a toggle in the top right corner).
4. Click **Load unpacked** and select the `eleetebattle-extension` folder located in this repository.
5. The extension should now be active in your browser.

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
