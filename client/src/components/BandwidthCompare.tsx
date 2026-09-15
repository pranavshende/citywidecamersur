import { SystemStatus } from '../types';
import { Network, CloudOff, CloudRain } from 'lucide-react';

interface BandwidthCompareProps {
  systemStatus: SystemStatus | null;
}

export default function BandwidthCompare({ systemStatus }: BandwidthCompareProps) {
  if (!systemStatus) return null;

  const { total_metadata_bytes: metadata_bytes, total_raw_video_bytes: raw_video_bytes } = systemStatus.summary;
  
  // Prevent division by zero if both are 0 at start
  const max = Math.max(metadata_bytes, raw_video_bytes, 1);
  const metaPct = (metadata_bytes / max) * 100;
  const rawPct = (raw_video_bytes / max) * 100;

  const savings = raw_video_bytes > 0 
    ? ((raw_video_bytes - metadata_bytes) / raw_video_bytes * 100).toFixed(1) 
    : '0.0';

  const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="glass-panel h-full flex-col">
      <div className="glass-header">
        <span className="glass-title"><Network size={14} className="text-indigo" /> Edge Bandwidth Analysis</span>
      </div>

      <div style={{ padding: 16 }} className="flex-col gap-4 flex-1 justify-center">
        
        {/* Central vs Edge Bar */}
        <div>
          <div className="flex justify-between" style={{ fontSize: '0.75rem', marginBottom: 6 }}>
            <span className="flex items-center gap-1 text-rose font-bold"><CloudRain size={14} /> Traditional Cloud (Raw Video)</span>
            <span className="mono">{formatMB(raw_video_bytes)} MB</span>
          </div>
          <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(rawPct, 2)}%`, height: '100%', background: 'var(--accent-rose)', transition: 'width 0.5s' }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between" style={{ fontSize: '0.75rem', marginBottom: 6 }}>
            <span className="flex items-center gap-1 text-emerald font-bold"><CloudOff size={14} /> Edge Computing (Metadata Only)</span>
            <span className="mono">{formatMB(metadata_bytes)} MB</span>
          </div>
          <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(metaPct, 2)}%`, height: '100%', background: 'var(--accent-emerald)', transition: 'width 0.5s' }} />
          </div>
        </div>

        <div className="flex justify-between items-center" style={{ marginTop: 8, paddingTop: 12, borderTop: '1px dashed var(--border-glass)' }}>
          <span className="label" style={{ marginBottom: 0 }}>Bandwidth Saved</span>
          <span className="text-cyan mono" style={{ fontSize: '1.25rem', fontWeight: 800 }}>{savings}%</span>
        </div>
      </div>
    </div>
  );
}
