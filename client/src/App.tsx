import { useAuth } from './hooks/useAuth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
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
              <Route path="*" element={<div style={{ padding: 24 }}>Coming soon. (Other routes are mocked for demo)</div>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}
