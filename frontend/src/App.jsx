import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

// === PHASE 5 IMPORTS ===
import Login from './pages/Login';
import Register from './pages/Register';

// === COMMENTED OUT UNTIL BUILT (Phases 6/7/8) ===
import Landing from './pages/Landing';
 import Invite from './pages/Invite';
 import Join from './pages/Join';
 import Room from './pages/Room';
 import Battle from './pages/Battle';
 import Matchmaking from './pages/Matchmaking';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* UNCOMMENT THESE AS YOU BUILD THEM */}
            { <Route path="/" element={<Landing />} /> }
            { <Route path="/invite" element={<Invite />} /> }
            { <Route path="/join" element={<Join />} /> }
            { <Route path="/room" element={<Room />} /> }
            { <Route path="/battle" element={<Battle />} /> }
            { <Route path="/matchmaking" element={<Matchmaking />} /> }
            { <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> }
            { <Route path="/leaderboard" element={<Leaderboard />} /> }
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}