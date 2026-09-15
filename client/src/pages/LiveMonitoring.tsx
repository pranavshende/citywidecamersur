import { useWebSocket } from '../hooks/useWebSocket';
import MapView from '../components/MapView';
import EventFeed from '../components/EventFeed';

export default function LiveMonitoring() {
  const { systemStatus, detections, trajectory } = useWebSocket();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '24px 24px 0 24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Live Monitoring</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Full screen tactical view of edge node detections</p>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: 24, padding: 24, minHeight: 0 }}>
        <div className="panel" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <MapView trajectory={trajectory} systemStatus={systemStatus} />
        </div>

        <div style={{ width: 400, display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%', overflow: 'hidden' }}>
          <EventFeed detections={detections} />
        </div>
      </div>
    </div>
  );
}
