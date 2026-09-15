import { LayoutDashboard, Radio, Search, Bell, Activity, Video, Database, FileText, Settings, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const menuItems = [
    { label: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { label: "Live Monitoring", path: "/live", icon: <Radio size={20} /> },
    { label: "Vehicle Search", path: "/search", icon: <Search size={20} /> },
    { label: "Alerts & Watchlist", path: "/alerts", icon: <Bell size={20} /> },
    { label: "Analytics", path: "/analytics", icon: <Activity size={20} /> },
    { label: "Cameras", path: "/cameras", icon: <Video size={20} /> },
    { label: "Edge Nodes", path: "/nodes", icon: <Database size={20} /> },
    { label: "Reports", path: "/reports", icon: <FileText size={20} /> },
    { label: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className={`sidebar-drawer ${isOpen ? 'open' : ''}`} style={{
      width: 260,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50
    }}>
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>C</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.5px' }}>CITYWIDE <span className="text-cyan">ANPR</span></div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Distributed Edge Surveillance</div>
          </div>
        </div>
        <button 
          className="show-on-mobile btn-icon" 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
        >
          <X size={20} />
        </button>
      </div>

      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {menuItems.map(item => (
          <NavLink
            key={item.label}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              borderRadius: 8,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-cyan-dim)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s'
            })}
          >
            <div style={{ color: 'inherit', opacity: 0.8 }}>{item.icon}</div>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '24px 20px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Activity size={16} className="text-emerald" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>System Health</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="flex justify-between"><span>ANPR Engine</span><span className="text-emerald">Online</span></div>
          <div className="flex justify-between"><span>Edge Nodes</span><span className="text-emerald">Online</span></div>
          <div className="flex justify-between"><span>Database</span><span className="text-emerald">Online</span></div>
          <div className="flex justify-between"><span>Network</span><span className="text-emerald">Stable</span></div>
        </div>
        <div style={{ marginTop: 16, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          Smart Cities. Safer Tomorrow.<br/>v1.0.0
        </div>
      </div>
    </div>
  );
}
