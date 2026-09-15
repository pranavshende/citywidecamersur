import { Activity, BarChart2 } from 'lucide-react';
import DetectionTrendChart from '../components/DetectionTrendChart';
import VehicleDistributionChart from '../components/VehicleDistributionChart';

export default function Analytics() {
  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
            <BarChart2 className="text-cyan" /> Analytics & Trends
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>System-wide metrics and historical detection analysis</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, height: 400 }}>
        <div className="flex flex-col min-h-0">
          <DetectionTrendChart />
        </div>
        <div className="flex flex-col min-h-0">
          <VehicleDistributionChart />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        <div className="panel p-6 flex flex-col items-center justify-center text-center gap-2">
          <Activity size={32} className="text-emerald mb-2" />
          <div className="text-3xl font-bold font-mono">99.8%</div>
          <div className="text-sm text-secondary">System Uptime (30d)</div>
        </div>
        <div className="panel p-6 flex flex-col items-center justify-center text-center gap-2">
          <BarChart2 size={32} className="text-cyan mb-2" />
          <div className="text-3xl font-bold font-mono">4.2M</div>
          <div className="text-sm text-secondary">Total Processed Plates (30d)</div>
        </div>
        <div className="panel p-6 flex flex-col items-center justify-center text-center gap-2">
          <Activity size={32} className="text-rose mb-2" />
          <div className="text-3xl font-bold font-mono">1,204</div>
          <div className="text-sm text-secondary">Total Alerts Raised (30d)</div>
        </div>
      </div>
    </div>
  );
}
