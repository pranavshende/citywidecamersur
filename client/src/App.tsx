import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import './index.css';

export default function App() {
  const { isAuthenticated, user, loginUser, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage onLogin={loginUser} />;
  }

  return <Dashboard user={user} onLogout={logout} />;
}
