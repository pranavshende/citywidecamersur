import { Trajectory } from '../types';
import { Route, Clock, Target } from 'lucide-react';

interface TrajectoryInfoProps {
  trajectory: Trajectory;
}

export default function TrajectoryInfo({ trajectory }: TrajectoryInfoProps) {
  return (
    <div className="glass-panel h-full flex-col">
      <div className="glass-header" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'var(--accent-emerald)' }}>
        <span className="glass-title text-emerald"><Route size={14} /> Reconstructed Trajectory</span>
        <div className="badge badge-emerald">MATCH FOUND</div>
      </div>

      <div style={{ padding: 16 }} className="flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="label">Target Vehicle</div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {trajectory.vehicle_plate}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="label">Confidence Score</div>
            <div className="text-emerald mono" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              98.4%
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 glass-panel" style={{ padding: 10, background: 'rgba(0,0,0,0.3)' }}>
            <div className="flex items-center gap-2 label"><Target size={12} /> Nodes Hit</div>
            <div className="mono" style={{ fontSize: '1.1rem' }}>{trajectory.total_detections} cameras</div>
          </div>
          <div className="flex-1 glass-panel" style={{ padding: 10, background: 'rgba(0,0,0,0.3)' }}>
            <div className="flex items-center gap-2 label"><Clock size={12} /> Tracking Duration</div>
            <div className="mono" style={{ fontSize: '1.1rem' }}>
              {Math.round((new Date(trajectory.last_seen || new Date()).getTime() - new Date(trajectory.first_seen || new Date()).getTime()) / 1000)} sec
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
