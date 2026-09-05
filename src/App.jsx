import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PetProfile from './pages/PetProfile';
import PublicProfile from './pages/PublicProfile';
import Clinics from './pages/Clinics';
import Marketplace from './pages/Marketplace';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import GeminiChatWidget from './components/GeminiChatWidget';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Secured Routes */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/pet/:id" 
            element={
              <PrivateRoute>
                <PetProfile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/clinics" 
            element={
              <PrivateRoute>
                <Clinics />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/marketplace" 
            element={
              <PrivateRoute>
                <Marketplace />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/messages/:chatId" 
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } 
          />

          {/* Public Route */}
          <Route path="/qr/:id" element={<PublicProfile />} />
        </Routes>
        <GeminiChatWidget />
      </Router>
    </AuthProvider>
  );
}

export default App;
// Trigger HMR refresh to fix Vite unresolved import state
