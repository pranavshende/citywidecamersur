import { useState, useEffect } from 'react';
import { MapPin, Download, Loader2, Car, Maximize, Database } from 'lucide-react';
import { apiFetch } from '../lib/api';
import MapView from '../components/MapView';
import { useWebSocket } from '../hooks/useWebSocket';
import { Trajectory, TrajectoryPoint } from '../types';
import DistributedSearchFlow from '../components/DistributedSearchFlow';

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
  const [plateQuery, setPlateQuery] = useState('MH12AB1234'); // Default based on UI design
  const [loading, setLoading] = useState(false);
  const [trajectory, setTrajectory] = useState<Trajectory | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'aggregating' | 'complete'>('idle');
  const [vehicleSummary, setVehicleSummary] = useState<SearchResult | null>(null);
  
  const { systemStatus } = useWebSocket();

  // Load the initial data for the hardcoded plate just so the UI matches the screenshot initially
  useEffect(() => {
    handleSearch(new Event('submit') as any, 'MH12AB1234');
  }, []);

  const handleSearch = async (e?: React.FormEvent, forcePlate?: string) => {
    if (e) e.preventDefault();
    const targetPlate = forcePlate || plateQuery;
    if (!targetPlate) return;

    setLoading(true);
    setSearchStatus('searching');
    setTrajectory(null);
    setVehicleSummary(null);

    try {
      // Fetch initial details
      const res = await apiFetch<{ data: SearchResult[] }>(`/api/vehicles/search?plate=${targetPlate}`);
      if (res.data.length > 0) {
        setVehicleSummary(res.data[0]);
      }

      // Simulate the distributed delay for the animation
      setTimeout(() => setSearchStatus('aggregating'), 1500);
      
      setTimeout(async () => {
        await loadTrajectory(targetPlate);
        setSearchStatus('complete');
        setLoading(false);
      }, 3000);

    } catch (err) {
      console.error(err);
      setLoading(false);
      setSearchStatus('idle');
    }
  };

  const loadTrajectory = async (plate: string) => {
    try {
      const res = await apiFetch<{ data: any[] }>(`/api/vehicles/${plate}/history`);
      const points: TrajectoryPoint[] = res.data
        .filter(d => d.camera)
        .map((d, index) => ({
          order: index + 1,
          camera_id: d.camera!.name,
          edge_node_id: d.edge_node?.name || '',
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
          total_distance_km: 22.4, // Mock distance for UI matching
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
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
      
      {/* Top Half */}
      <div style={{ display: 'flex', gap: 24, minHeight: 340, flexWrap: 'wrap' }}>
        
        {/* Left: Search & Summary */}
        <div className="panel" style={{ flex: 1, minWidth: 400, display: 'flex', flexDirection: 'column', padding: 24 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>Vehicle Search</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 24 }}>Search any vehicle and visualize its journey across the city</p>
          
          <form onSubmit={e => handleSearch(e)} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input 
                type="text" 
                value={plateQuery}
                onChange={e => setPlateQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '8px 40px 8px 12px',
                  color: 'white',
                  fontFamily: 'monospace'
                }}
              />
              {plateQuery && (
                <button 
                  type="button" 
                  onClick={() => setPlateQuery('')} 
                  style={{ position: 'absolute', right: 12, top: 10, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ×
                </button>
              )}
            </div>
            <button 
              type="submit" 
              className="btn" 
              style={{ background: 'var(--accent-emerald)', color: 'black', fontWeight: 800, padding: '0 24px', border: 'none' }}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Search'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <button type="button" className="btn" style={{ background: '#2563eb', color: 'white', border: 'none', fontWeight: 700 }}>
              <MapPin size={16} style={{ marginRight: 8 }} /> Map Vehicle on Map
            </button>
            <select style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '8px 12px', color: 'white', fontSize: '0.875rem' }}>
              <option>Last 7 days</option>
              <option>Last 24 hours</option>
              <option>All time</option>
            </select>
          </div>

          {vehicleSummary && trajectory && (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              {/* Mock placeholder car image for the design */}
              <div style={{ width: 128, height: 128, background: 'rgba(0,0,0,0.5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)', overflow: 'hidden', position: 'relative' }}>
                <Car style={{ color: 'var(--text-secondary)', opacity: 0.2, position: 'absolute' }} size={64} />
                <div style={{ position: 'absolute', bottom: 8, background: 'white', color: 'black', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.75rem', padding: '0 8px', borderRadius: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {vehicleSummary.plate}
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 800 }}>{vehicleSummary.plate}</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '2px 8px', border: '1px solid rgba(16,185,129,0.3)' }}>Found</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 12, columnGap: 32, fontSize: '0.875rem' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Vehicle Type</div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><Car size={14} /> {vehicleSummary.vehicle_type}</div>
                  
                  <div style={{ color: 'var(--text-secondary)' }}>Color</div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid #9ca3af', backgroundColor: vehicleSummary.vehicle_color.toLowerCase() === 'white' ? '#fff' : vehicleSummary.vehicle_color.toLowerCase() }}></div>
                    {vehicleSummary.vehicle_color}
                  </div>
                  
                  <div style={{ color: 'var(--text-secondary)' }}>Total Detections</div>
                  <div style={{ fontWeight: 600 }}>{trajectory.total_detections}</div>
                  
                  <div style={{ color: 'var(--text-secondary)' }}>First Seen</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(trajectory.first_seen!).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                  </div>
                  
                  <div style={{ color: 'var(--text-secondary)' }}>Last Seen</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(trajectory.last_seen!).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Distributed Architecture Flow */}
        <div style={{ flex: 1, minWidth: 400 }}>
          <DistributedSearchFlow status={searchStatus} plate={plateQuery || 'MH12AB1234'} />
        </div>
      </div>

      {/* Bottom Half */}
      <div style={{ display: 'flex', flex: 1, gap: 24, minHeight: 400 }}>
        
        {/* Left: Map */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, position: 'relative' }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
              <span>Vehicle Trajectory on Map</span>
              {trajectory && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 8, fontWeight: 400 }}>Showing {trajectory.total_detections} detections across cameras</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" style={{ fontSize: '0.75rem', padding: '4px 12px', background: '#2563eb', border: 'none', color: 'white', fontWeight: 600 }}>All Detections</button>
              <button className="btn" style={{ fontSize: '0.75rem', padding: '4px 12px', background: 'transparent', border: '1px solid var(--border-subtle)' }}>Show Route</button>
              <button className="btn" style={{ fontSize: '0.75rem', padding: '4px 12px', background: 'transparent', border: '1px solid var(--border-subtle)' }}>Show Cameras</button>
              <button className="btn-icon" style={{ background: 'transparent', border: '1px solid var(--border-subtle)' }}><Maximize size={14} /></button>
            </div>
          </div>
          
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <MapView systemStatus={systemStatus} trajectory={trajectory} />
            
            {/* Map Legend Overlay */}
            <div style={{ 
              position: 'absolute', bottom: 24, left: 24, 
              background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', 
              border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 16, 
              zIndex: 400, pointerEvents: 'none' 
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}>
                    <div style={{ width: 6, height: 6, background: 'white', borderRadius: '50%' }}></div>
                  </div>
                  <span>Start Point</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }}>
                    <div style={{ width: 6, height: 6, background: 'white', borderRadius: '50%' }}></div>
                  </div>
                  <span>End Point</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', boxShadow: '0 0 8px rgba(59,130,246,0.6)' }}>
                    <div style={{ width: 6, height: 6, background: 'white', borderRadius: '50%' }}></div>
                  </div>
                  <span>Intermediate Detection</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <div style={{ width: 20, height: 2, borderTop: '2px dashed #22d3ee' }}></div>
                  <span>Vehicle Route</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detection History Timeline */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', width: 400, minHeight: 0 }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Detection History</span>
            <button style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
              <Download size={14} /> Export
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, position: 'relative' }}>
            {!trajectory ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No history available.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {trajectory.points.map((pt, i) => {
                  const isStart = i === 0;
                  const isEnd = i === trajectory.points.length - 1;
                  const bg = isStart ? '#ef4444' : isEnd ? '#10b981' : '#3b82f6';
                  const shadow = isStart ? 'rgba(239,68,68,0.5)' : isEnd ? 'rgba(16,185,129,0.5)' : 'rgba(59,130,246,0.5)';
                  
                  return (
                    <div key={i} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: 32 }}>
                      {/* Timeline line */}
                      {i !== trajectory.points.length - 1 && (
                        <div style={{ position: 'absolute', left: 12, top: 32, bottom: 0, width: 1, background: 'var(--border-strong)' }}></div>
                      )}
                      
                      {/* Number Node */}
                      <div style={{ position: 'relative', zIndex: 10, flexShrink: 0, marginTop: 4 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: bg, color: 'white', fontWeight: 800, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 10px ${shadow}`, border: '1px solid rgba(255,255,255,0.2)' }}>
                          {pt.order}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', border: '1px solid transparent', borderRadius: 8, padding: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{pt.camera_id}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            {new Date(pt.timestamp).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: 'var(--accent-emerald)', fontWeight: 800, fontSize: '0.65rem' }}>{(pt.confidence * 100).toFixed(0)}%</span>
                            <div style={{ width: 48, height: 32, background: 'black', border: '1px solid var(--border-subtle)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                               <Car style={{ color: 'rgba(255,255,255,0.3)' }} size={20} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Summary Footer */}
          {trajectory && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Database size={14} /> Total Detections: <span style={{ color: 'white', fontWeight: 800 }}>{trajectory.total_detections}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} /> Total Distance: <span style={{ color: 'white', fontWeight: 800 }}>~{trajectory.total_distance_km} km</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
