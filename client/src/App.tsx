import { useAuth } from './hooks/useAuth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';

import LiveMonitoring from './pages/LiveMonitoring';
import VehicleSearch from './pages/VehicleSearch';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Cameras from './pages/Cameras';
import EdgeNodes from './pages/EdgeNodes';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import './index.css';

export default function App() {
  const { isAuthenticated, user, loginUser, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage onLogin={loginUser} />;
  }

  return (
    <Router>
      <div className="command-center">
        <Sidebar />
        <div className="main-content">
          <TopNav user={user} onLogout={logout} />
          <div style={{ flex: 1, position: 'relative' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/live" element={<LiveMonitoring />} />
              <Route path="/search" element={<VehicleSearch />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/cameras" element={<Cameras />} />
              <Route path="/nodes" element={<EdgeNodes />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<div style={{ padding: 24 }}>Coming soon. (Other routes are mocked for demo)</div>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}
