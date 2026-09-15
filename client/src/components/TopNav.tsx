import { useState } from 'react';
import { Search, Bell, User as UserIcon, ChevronDown } from 'lucide-react';
import { User } from '../types';

interface TopNavProps {
  user: User | null;
  onLogout: () => void;
}

export default function TopNav({ user, onLogout }: TopNavProps) {
  const [search, setSearch] = useState('');

  return (
    <div style={{
      height: 72,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 20
    }}>
      {/* Global Search */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480
        }}>
          <Search size={18} style={{ position: 'absolute', top: 12, left: 16, color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search vehicle number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              paddingLeft: 44,
              height: 42,
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border-strong)',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        
        {/* System Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--accent-emerald-dim)',
          padding: '6px 12px',
          borderRadius: 20,
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>System Online</span>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="var(--text-secondary)" />
          <div style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 14,
            height: 14,
            background: 'var(--accent-rose)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.55rem',
            fontWeight: 800,
            color: 'white'
          }}>3</div>
        </div>

        {/* User Profile */}
        <div 
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--border-subtle)', paddingLeft: 24, cursor: 'pointer' }}
          title="Click to logout"
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--accent-cyan-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)'
          }}>
            <UserIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              {user?.full_name || user?.username || 'Operator'}
              <ChevronDown size={14} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{user?.role === 'admin' ? 'Administrator' : 'Police Officer'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
