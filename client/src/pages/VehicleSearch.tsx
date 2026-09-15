import { useState, useEffect } from 'react';
import { Search, MapPin, Download, Loader2, Car, Maximize } from 'lucide-react';
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
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);
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
    setSelectedPlate(null);
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
    setSelectedPlate(plate);
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[340px]">
        
        {/* Left: Search & Summary */}
        <div className="panel flex flex-col p-6">
          <h1 className="text-xl font-bold mb-1">Vehicle Search</h1>
          <p className="text-sm text-secondary mb-6">Search any vehicle and visualize its journey across the city</p>
          
          <form onSubmit={e => handleSearch(e)} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={plateQuery}
                onChange={e => setPlateQuery(e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-subtle)] rounded-lg py-2 pl-3 pr-10 text-white font-mono"
              />
              {plateQuery && <button type="button" onClick={() => setPlateQuery('')} className="absolute right-3 top-2.5 text-secondary text-sm">×</button>}
            </div>
            <button type="submit" className="btn bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 border-none disabled:opacity-50" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Search'}
            </button>
          </form>

          <div className="flex justify-between items-center mb-6">
            <button type="button" className="btn bg-blue-600 hover:bg-blue-700 text-white border-none font-bold">
              <MapPin size={16} className="mr-2" /> Map Vehicle on Map
            </button>
            <select className="bg-[rgba(0,0,0,0.3)] border border-[var(--border-subtle)] rounded py-2 px-3 text-sm text-white">
              <option>Last 7 days</option>
              <option>Last 24 hours</option>
              <option>All time</option>
            </select>
          </div>

          {vehicleSummary && trajectory && (
            <div className="flex gap-6 items-start bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[var(--border-subtle)]">
              {/* Mock placeholder car image for the design */}
              <div className="w-32 h-32 bg-[rgba(0,0,0,0.5)] rounded-lg flex items-center justify-center border border-[var(--border-glass)] overflow-hidden relative">
                <Car className="text-secondary opacity-20 absolute" size={64} />
                <div className="absolute bottom-2 bg-white text-black font-mono font-bold text-xs px-2 py-0.5 rounded shadow">
                  {vehicleSummary.plate}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-xl font-bold">{vehicleSummary.plate}</span>
                  <span className="badge badge-emerald text-[0.65rem] px-2 py-0.5 border-emerald-500/30">Found</span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                  <div className="text-secondary">Vehicle Type</div>
                  <div className="font-semibold flex items-center gap-2"><Car size={14} /> {vehicleSummary.vehicle_type}</div>
                  
                  <div className="text-secondary">Color</div>
                  <div className="font-semibold flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-gray-400" style={{ backgroundColor: vehicleSummary.vehicle_color.toLowerCase() === 'white' ? '#fff' : vehicleSummary.vehicle_color.toLowerCase() }}></div>
                    {vehicleSummary.vehicle_color}
                  </div>
                  
                  <div className="text-secondary">Total Detections</div>
                  <div className="font-semibold">{trajectory.total_detections}</div>
                  
                  <div className="text-secondary">First Seen</div>
                  <div className="font-mono text-xs text-muted">
                    {new Date(trajectory.first_seen!).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                  </div>
                  
                  <div className="text-secondary">Last Seen</div>
                  <div className="font-mono text-xs text-muted">
                    {new Date(trajectory.last_seen!).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Distributed Architecture Flow */}
        <DistributedSearchFlow status={searchStatus} plate={plateQuery || 'MH12AB1234'} />
      </div>


      {/* Bottom Half */}
      <div className="flex flex-1 gap-6 min-h-[400px]">
        
        {/* Left: Map */}
        <div className="panel flex flex-col flex-1 min-h-0 relative">
          <div className="panel-header flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-secondary" />
              <span>Vehicle Trajectory on Map</span>
              {trajectory && <span className="text-xs text-secondary ml-2 font-normal">Showing {trajectory.total_detections} detections across cameras</span>}
            </div>
            <div className="flex gap-2">
              <button className="btn text-xs py-1 px-3 bg-blue-600 border-none text-white font-semibold hover:bg-blue-700">All Detections</button>
              <button className="btn text-xs py-1 px-3 bg-transparent border border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.05)]">Show Route</button>
              <button className="btn text-xs py-1 px-3 bg-transparent border border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.05)]">Show Cameras</button>
              <button className="btn-icon bg-transparent border border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.05)]"><Maximize size={14} /></button>
            </div>
          </div>
          
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <MapView systemStatus={systemStatus} trajectory={trajectory} />
            
            {/* Map Legend Overlay */}
            <div className="absolute bottom-6 left-6 bg-[rgba(15,23,42,0.85)] backdrop-blur-md border border-[var(--border-subtle)] rounded-lg p-4 z-[400] pointer-events-none">
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center border-2 border-white shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <span>Start Point</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white shadow-[0_0_8px_rgba(16,185,129,0.6)]">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <span>End Point</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <span>Intermediate Detection</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-5 h-0.5 border-t-2 border-dashed border-cyan-400"></div>
                  <span>Vehicle Route</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detection History Timeline */}
        <div className="panel flex flex-col w-[400px] min-h-0">
          <div className="panel-header flex justify-between items-center">
            <span>Detection History</span>
            <button className="text-cyan text-xs font-semibold flex items-center gap-1 hover:underline">
              <Download size={14} /> Export
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 relative">
            {!trajectory ? (
              <div className="absolute inset-0 flex items-center justify-center text-secondary text-sm">
                No history available.
              </div>
            ) : (
              <div className="flex flex-col">
                {trajectory.points.map((pt, i) => {
                  const isStart = i === 0;
                  const isEnd = i === trajectory.points.length - 1;
                  const colorClass = isStart ? 'bg-rose-500 shadow-rose-500/50' : isEnd ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-blue-500 shadow-blue-500/50';
                  
                  return (
                    <div key={i} className="flex gap-4 relative pb-8 group">
                      {/* Timeline line */}
                      {i !== trajectory.points.length - 1 && (
                        <div className="absolute left-3 top-8 bottom-0 w-px bg-[var(--border-strong)]"></div>
                      )}
                      
                      {/* Number Node */}
                      <div className="relative z-10 shrink-0 mt-1">
                        <div className={`w-6 h-6 rounded-full ${colorClass} text-white font-bold text-[0.65rem] flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white/20`}>
                          {pt.order}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 flex justify-between items-start bg-[rgba(255,255,255,0.02)] border border-transparent group-hover:border-[var(--border-subtle)] rounded-lg p-2 transition-colors">
                        <div>
                          <div className="font-semibold text-sm mb-1">{pt.camera_id}</div>
                          <div className="text-xs text-secondary mono">
                            {new Date(pt.timestamp).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold text-[0.65rem]">{(pt.confidence * 100).toFixed(0)}%</span>
                            <div className="w-12 h-8 bg-black border border-[var(--border-subtle)] rounded flex items-center justify-center overflow-hidden relative">
                               <Car className="text-white/30" size={20} />
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
            <div className="border-t border-[var(--border-subtle)] p-4 flex justify-between items-center text-xs text-secondary bg-[rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-2">
                <Database size={14} /> Total Detections: <span className="text-white font-bold">{trajectory.total_detections}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} /> Total Distance: <span className="text-white font-bold">~{trajectory.total_distance_km} km</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
