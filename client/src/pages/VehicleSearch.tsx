import { useState } from 'react';
import { Search, Loader2, Camera } from 'lucide-react';
import { apiFetch } from '../lib/api';
import MapView from '../components/MapView';
import { useWebSocket } from '../hooks/useWebSocket';
import { Trajectory, TrajectoryPoint } from '../types';

interface SearchResult {
  id: string;
  plate: string;
  vehicle_type: string;
  vehicle_color: string;
  timestamp: string;
  confidence: number;
  camera?: {
    name: string;
    location_name: string;
  };
}

export default function VehicleSearch() {
  const [plateQuery, setPlateQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);
  const [trajectory, setTrajectory] = useState<Trajectory | null>(null);
  
  // Reuse websocket just to get systemStatus to pass to MapView so it renders cameras
  const { systemStatus } = useWebSocket();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!plateQuery) return;

    setLoading(true);
    setSelectedPlate(null);
    setTrajectory(null);
    try {
      const res = await apiFetch<{ data: SearchResult[] }>(`/api/vehicles/search?plate=${plateQuery}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrajectory = async (plate: string) => {
    setSelectedPlate(plate);
    try {
      const res = await apiFetch<{ data: any[] }>(`/api/vehicles/${plate}/history`);
      const points: TrajectoryPoint[] = res.data
        .filter(d => d.camera)
        .map((d, index) => ({
          order: index + 1,
          camera_id: d.camera!.id,
          edge_node_id: d.edge_node?.id || '',
          latitude: Number(d.camera!.latitude),
          longitude: Number(d.camera!.longitude),
          timestamp: d.timestamp,
          confidence: Number(d.confidence) || 0.9,
          vehicle_type: d.vehicle_type || 'Unknown',
          vehicle_color: d.vehicle_color || 'Unknown',
          number_plate: d.plate
        }));

      if (points.length > 0) {
        setTrajectory({
          id: `traj-${Date.now()}`,
          query_id: 'search-query',
          vehicle_plate: plate,
          points,
          first_seen: res.data[0].timestamp,
          last_seen: res.data[res.data.length - 1].timestamp,
          total_detections: points.length,
          total_distance_km: 0,
          status: 'complete'
        });
      } else {
        setTrajectory(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Vehicle Search & Trajectory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Search vehicle plates across the city network</p>
        </div>
      </div>

      <div className="panel" style={{ padding: 16 }}>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div style={{ flex: 1, position: 'relative' }}>
            <Search className="absolute left-3 top-3 text-cyan" size={20} />
            <input 
              type="text" 
              placeholder="Enter license plate..." 
              value={plateQuery}
              onChange={e => setPlateQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                padding: '10px 10px 10px 40px',
                borderRadius: 8,
                color: 'white',
                fontFamily: 'monospace',
                fontSize: '1.1rem'
              }}
            />
          </div>
          <button type="submit" className="btn" style={{ background: 'var(--accent-cyan)', color: 'black', fontWeight: 800, padding: '0 24px', borderRadius: 8 }}>
            SEARCH
          </button>
        </form>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="panel flex-col flex-1 min-h-0">
          <div className="panel-header">Search Results</div>
          <div className="panel-content" style={{ overflowY: 'auto', padding: 0 }}>
            {loading ? (
              <div className="p-8 flex items-center justify-center text-cyan"><Loader2 className="animate-spin" /></div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-muted">No vehicles found. Try searching a plate number.</div>
            ) : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th className="p-3 font-semibold text-secondary text-sm">Plate</th>
                    <th className="p-3 font-semibold text-secondary text-sm">Vehicle Details</th>
                    <th className="p-3 font-semibold text-secondary text-sm">Last Seen At</th>
                    <th className="p-3 font-semibold text-secondary text-sm">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr 
                      key={r.id} 
                      onClick={() => loadTrajectory(r.plate)}
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.05)', 
                        cursor: 'pointer',
                        background: selectedPlate === r.plate ? 'var(--accent-cyan-dim)' : 'transparent',
                      }}
                      className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      <td className="p-3 mono font-bold text-lg">{r.plate}</td>
                      <td className="p-3 text-sm">
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{r.vehicle_color} {r.vehicle_type}</span>
                      </td>
                      <td className="p-3 text-sm text-secondary mono">
                        {new Date(r.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 text-sm text-secondary">
                        <div className="flex items-center gap-2"><Camera size={14}/> {r.camera?.name}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="panel flex-1 flex-col relative min-h-0" style={{ overflow: 'hidden' }}>
          <div className="panel-header flex justify-between">
            <span>Trajectory Mapping</span>
            {selectedPlate && <span className="badge badge-cyan">{selectedPlate}</span>}
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {selectedPlate ? (
              <MapView systemStatus={systemStatus} trajectory={trajectory} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted text-sm bg-[rgba(0,0,0,0.2)]">
                Select a vehicle from the results to view its trajectory across the city.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
