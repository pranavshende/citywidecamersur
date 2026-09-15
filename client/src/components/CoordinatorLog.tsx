import { CoordinatorStep } from '../types';
import { Terminal } from 'lucide-react';

interface CoordinatorLogProps {
  steps: CoordinatorStep[];
}

export default function CoordinatorLog({ steps }: CoordinatorLogProps) {
  return (
    <div className="glass-panel h-full flex-col">
      <div className="glass-header">
        <span className="glass-title"><Terminal size={14} className="text-amber" /> Coordinator Matrix</span>
      </div>

      <div className="flex-1 overflow-auto mono" style={{ padding: 12, fontSize: '0.75rem' }}>
        {steps.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>&gt; Coordinator idle... awaiting commands.</div>
        ) : (
          <div className="flex-col gap-2">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="animate-slide-in"
                style={{
                  display: 'flex',
                  gap: 8,
                  padding: '6px 8px',
                  background: step.status === 'in_progress' ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                  borderLeft: step.status === 'in_progress' ? '2px solid var(--accent-amber)' : '2px solid transparent',
                  color: step.status === 'complete' ? 'var(--text-secondary)' : 'var(--text-primary)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ width: 80, color: 'var(--accent-indigo)' }}>
                  {new Date().toISOString().split('T')[1].slice(0, 12)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: step.status === 'in_progress' ? 600 : 400 }}>
                    {step.step}
                  </div>
                  
                </div>
                
                <div style={{ 
                  color: step.status === 'complete' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                  fontWeight: 600
                }}>
                  [{step.status === 'complete' ? 'OK' : 'RUN'}]
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
