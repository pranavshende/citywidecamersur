import { User, SystemStatus } from '../types';
import { Shield, Wifi, WifiOff, LogOut } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  connected: boolean;
  systemStatus: SystemStatus | null;
}

export default function Header({ user, onLogout, connected, systemStatus }: HeaderProps) {
  return (
    <header className="glass-panel" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-cyan" />
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
            CityWide <span className="text-cyan">ANPR</span>
          </h1>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            Distributed Edge Surveillance
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* System Health */}
        <div className="flex items-center gap-2" style={{ borderRight: '1px solid var(--border-glass)', paddingRight: 16 }}>
          <div className="flex items-center gap-2">
            {connected ? (
              <><Wifi size={16} className="text-emerald" /><span className="text-emerald mono" style={{ fontSize: '0.75rem' }}>WS CONNECTED</span></>
            ) : (
              <><WifiOff size={16} className="text-rose" /><span className="text-rose mono" style={{ fontSize: '0.75rem' }}>WS DISCONNECTED</span></>
            )}
          </div>
          {systemStatus && (
            <div className="badge badge-cyan" style={{ marginLeft: 8 }}>
              {systemStatus.summary.online_nodes}/{systemStatus.summary.total_nodes} NODES ONLINE
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user?.full_name || user?.username}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Badge: {user?.badge_number || 'N/A'}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
