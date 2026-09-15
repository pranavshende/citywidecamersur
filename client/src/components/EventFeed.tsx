import { DetectionEvent } from '../types';
import { Camera, MapPin, ScanEye } from 'lucide-react';

interface EventFeedProps {
  detections: DetectionEvent[];
}

export default function EventFeed({ detections }: EventFeedProps) {
  // Sort by timestamp descending
  const sorted = [...detections].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="glass-panel h-full flex-col">
      <div className="glass-header">
        <span className="glass-title"><ScanEye size={14} className="text-rose" /> Live Intercept Feed</span>
        <div className="badge badge-rose animate-pulse">LIVE</div>
      </div>

      <div className="flex-1 overflow-auto" style={{ padding: 12 }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Awaiting edge node detections...
          </div>
        ) : (
          <div className="flex-col gap-3">
            {sorted.map((det, idx) => (
              <div
                key={`${det.camera_id}-${det.timestamp}-${idx}`}
                className="animate-slide-in"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  padding: 12,
                  borderLeft: `3px solid ${det.confidence > 0.9 ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Scanline effect */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '100%',
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.03), transparent)',
                  animation: 'scanline 2s linear infinite',
                  pointerEvents: 'none'
                }} />

                <div className="flex justify-between items-center mb-2">
                  <div className="mono font-bold" style={{ fontSize: '1rem', color: 'var(--text-primary)', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
                    {det.number_plate}
                  </div>
                  <div className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>
                    {(det.confidence * 100).toFixed(1)}% CONF
                  </div>
                </div>

                <div className="flex-col gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-2">
                    <Camera size={12} className="text-cyan" /> {det.camera_id} ({det.edge_node_id})
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-cyan" /> {det.latitude.toFixed(4)}, {det.longitude.toFixed(4)}
                  </div>
                  <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
                      {det.vehicle_color} {det.vehicle_type}
                    </span>
                    <span className="mono" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
                      {new Date(det.timestamp).toLocaleTimeString([], { hour12: false })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
