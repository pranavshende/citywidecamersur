import { SystemStatus } from '../types';
import { Cpu, Activity, Database } from 'lucide-react';

interface EdgeNodeStatusProps {
  systemStatus: SystemStatus | null;
}

export default function EdgeNodeStatus({ systemStatus }: EdgeNodeStatusProps) {
  if (!systemStatus) return null;

  return (
    <div className="glass-panel">
      <div className="glass-header">
        <span className="glass-title"><Database size={14} className="text-emerald" /> Edge Node Grid</span>
      </div>

      <div style={{ padding: 12 }}>
        {systemStatus.edge_nodes.map(node => (
          <div
            key={node.id}
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              transition: 'background var(--transition-fast)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`status-dot ${node.status}`} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{node.name}</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }} className="mono">
                {node.id}
              </div>
            </div>

            <div className="flex justify-between" style={{ fontSize: '0.7rem' }}>
              <div className="flex items-center gap-1" style={{ color: node.cpu_usage > 80 ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
                <Cpu size={12} /> {node.cpu_usage.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <Activity size={12} /> {node.fps} FPS
              </div>
            </div>
            
            {/* Visual Load Bar */}
            <div style={{ width: '100%', height: 2, background: 'var(--border-glass)', borderRadius: 1 }}>
               <div style={{
                 width: `${node.cpu_usage}%`,
                 height: '100%',
                 background: node.cpu_usage > 80 ? 'var(--accent-rose)' : 'var(--accent-cyan)',
                 borderRadius: 1
               }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
