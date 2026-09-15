import { useState, useEffect } from 'react';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('anpr_token');
    const savedUser = sessionStorage.getItem('anpr_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  function loginUser(tokenValue: string, userData: User) {
    sessionStorage.setItem('anpr_token', tokenValue);
    sessionStorage.setItem('anpr_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }

  function logout() {
    sessionStorage.removeItem('anpr_token');
    sessionStorage.removeItem('anpr_user');
    setToken(null);
    setUser(null);
  }

  return { user, token, isAuthenticated: !!token, loginUser, logout };
}
