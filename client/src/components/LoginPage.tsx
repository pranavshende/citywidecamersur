import { useState } from 'react';
import { Shield, Lock, User as UserIcon } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, pass: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ width: 400, overflow: 'hidden' }}>
        
        {/* Decorative Top Bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-indigo))' }} />

        <div style={{ padding: '40px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Shield size={32} className="text-cyan" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              CityWide <span className="text-cyan">ANPR</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
              Authorized Personnel Only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex-col gap-4">
            <div className="relative">
              <UserIcon size={16} style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Operator ID"
                className="input"
                style={{ paddingLeft: 40 }}
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Lock size={16} style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Passcode"
                className="input"
                style={{ paddingLeft: 40 }}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 8, padding: '12px 16px' }}>
              ACCESS TERMINAL
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
