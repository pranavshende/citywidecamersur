import { Play, RotateCcw, RefreshCw, Power } from 'lucide-react';
import { startDemo, resetDemo, restoreAll } from '../services/api';
import { DemoStep } from '../types';

interface DemoControlsProps {
  demoStep: DemoStep | null;
  onClearState?: () => void;
}

export default function DemoControls({ demoStep, onClearState }: DemoControlsProps) {
  async function handleStartDemo() {
    onClearState?.();
    await startDemo();
  }

  async function handleReset() {
    onClearState?.();
    await resetDemo();
  }

  async function handleRestore() {
    await restoreAll();
  }

  const progress = demoStep ? Math.round((demoStep.step / demoStep.total_steps) * 100) : 0;
  const isRunning = demoStep !== null && demoStep.status !== 'complete';

  return (
    <div className="glass-panel">
      <div className="glass-header">
        <span className="glass-title"><Power size={14} className="text-cyan" /> Simulator Controls</span>
      </div>

      <div style={{ padding: 16 }}>
        <div className="flex gap-2" style={{ marginBottom: 12 }}>
          <button
            className="btn btn-primary flex-1"
            onClick={handleStartDemo}
            disabled={isRunning}
          >
            {isRunning ? <RefreshCw size={16} className="spin" /> : <Play size={16} />} 
            {isRunning ? 'RUNNING' : 'INITIATE'}
          </button>
          <button
            className="btn btn-danger"
            onClick={handleReset}
            disabled={isRunning}
            title="Reset Simulation"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <button
          className="btn w-full"
          onClick={handleRestore}
          style={{ fontSize: '0.75rem' }}
        >
          <RefreshCw size={14} className="text-emerald" /> Restore Offline Nodes
        </button>

        {/* HUD Progress Bar */}
        {demoStep && (
          <div className="animate-slide-in" style={{ marginTop: 16 }}>
            <div className="flex justify-between" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>
              <span>SEQ {demoStep.step}/{demoStep.total_steps}</span>
              <span className="mono">{progress}%</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--accent-cyan)',
                boxShadow: '0 0 10px var(--accent-cyan-glow)',
                transition: 'width 0.5s ease'
              }} />
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: demoStep.status === 'complete' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              marginTop: 8,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              {demoStep.status === 'complete' ? <span style={{fontSize: '1rem'}}>✓</span> : <RefreshCw size={12} className="spin" />}
              {demoStep.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
