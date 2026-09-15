import { useWebSocket } from '../hooks/useWebSocket';
import MapView from './MapView';
import EventFeed from './EventFeed';
import KPIGrid from './KPIGrid';
import DetectionTrendChart from './DetectionTrendChart';
import VehicleDistributionChart from './VehicleDistributionChart';
import RecentAlertsList from './RecentAlertsList';

export default function Dashboard() {
  const {
    systemStatus,
    detections,
    trajectory
  } = useWebSocket();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* KPI Row */}
      <KPIGrid />

      {/* Main Split Area */}
      <div style={{ display: 'flex', flex: 1, gap: 16, padding: '0 24px', minHeight: 0 }}>
        
        {/* Left: Map */}
        <div className="panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 400 }}>
          <MapView trajectory={trajectory} systemStatus={systemStatus} />
        </div>

        {/* Right: Live Feed */}
        <div style={{ width: 340, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <EventFeed detections={detections} />
        </div>

      </div>

      {/* Bottom Analytics Row */}
      <div style={{ display: 'flex', gap: 16, padding: '16px 24px', height: 260 }}>
        <div style={{ flex: 2, minWidth: 0 }}>
          <DetectionTrendChart />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <VehicleDistributionChart />
        </div>
        <div style={{ flex: 2, minWidth: 0 }}>
          <RecentAlertsList />
        </div>
      </div>
    </div>
  );
}
