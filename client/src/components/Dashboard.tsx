import { useWebSocket } from '../hooks/useWebSocket';
import Header from './Header';
import SearchPanel from './SearchPanel';
import MapView from './MapView';
import EventFeed from './EventFeed';
import EdgeNodeStatus from './EdgeNodeStatus';
import CoordinatorLog from './CoordinatorLog';
import BandwidthCompare from './BandwidthCompare';
import TrajectoryInfo from './TrajectoryInfo';
import DemoControls from './DemoControls';
import { User } from '../types';

interface DashboardProps {
  user: User | null;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const {
    connected,
    systemStatus,
    detections,
    coordinatorSteps,
    trajectory,
    demoStep,
    clearState
  } = useWebSocket();

  return (
    <div className="hud-container">
      {/* BASE LAYER: Full Screen Map */}
      <MapView trajectory={trajectory} systemStatus={systemStatus} />

      {/* OVERLAY LAYER: Floating HUD Panels */}
      <div className="hud-layer">
        
        {/* Top Floating Bar */}
        <Header
          user={user}
          onLogout={onLogout}
          connected={connected}
          systemStatus={systemStatus}
        />

        {/* Main HUD Area */}
        <div className="flex flex-1 gap-4" style={{ marginTop: 16, minHeight: 0 }}>
          
          {/* Left HUD Panel: Controls & Status */}
          <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', paddingRight: 4 }}>
            <SearchPanel />
            <DemoControls demoStep={demoStep} onClearState={clearState} />
            <EdgeNodeStatus systemStatus={systemStatus} />
          </div>

          {/* Center: Transparent area for viewing the map */}
          <div className="flex-1" />

          {/* Right HUD Panel: Live Feed */}
          <div style={{ width: 320, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <EventFeed detections={detections} />
          </div>
          
        </div>

        {/* Bottom HUD Panel: Logs & Metrics */}
        <div className="flex gap-4" style={{ marginTop: 16, height: 220 }}>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <CoordinatorLog steps={coordinatorSteps} />
          </div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            {trajectory ? (
              <TrajectoryInfo trajectory={trajectory} />
            ) : (
              <BandwidthCompare systemStatus={systemStatus} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
