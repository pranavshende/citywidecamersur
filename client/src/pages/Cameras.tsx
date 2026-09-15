import { useState, useEffect } from 'react';
import { Video, Loader2, Server, Activity } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface Camera {
  id: string;
  name: string;
  location_name: string;
  status: string;
  fps: number;
  edge_node_id: string;
}

export default function Cameras() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await apiFetch<{ data: Camera[] }>('/api/system/cameras');
        setCameras(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCameras();
    // Refresh every 5s for live status updates
    const int = setInterval(fetchCameras, 5000);
    return () => clearInterval(int);
  }, []);

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Video className="text-emerald" /> Camera Network
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Live status of all connected ANPR cameras</p>
        </div>
        <div className="flex gap-4">
          <div className="panel px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">{cameras.filter(c => c.status === 'online').length} Online</span>
          </div>
          <div className="panel px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-bold text-rose-500">{cameras.filter(c => c.status === 'offline').length} Offline</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-cyan"><Loader2 className="animate-spin" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {cameras.map(cam => (
            <div key={cam.id} className="panel" style={{ padding: 20 }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="mono font-bold text-lg">{cam.id}</div>
                  <div className="text-sm text-secondary">{cam.name}</div>
                </div>
                <span className="badge" style={{ 
                  background: cam.status === 'online' ? 'var(--accent-emerald-dim)' : 'var(--accent-rose-dim)', 
                  color: cam.status === 'online' ? 'var(--accent-emerald)' : 'var(--accent-rose)' 
                }}>
                  {cam.status.toUpperCase()}
                </span>
              </div>
              
              <div className="flex flex-col gap-3 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-cyan" /> {cam.fps} FPS Capture Rate
                </div>
                <div className="flex items-center gap-2">
                  <Server size={14} className="text-cyan" /> Edge Node: {cam.edge_node_id}
                </div>
              </div>

              <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button className="btn text-xs" style={{ background: 'var(--bg-tertiary)' }}>View Live Feed</button>
                <button className="btn text-xs" style={{ background: 'transparent', border: '1px solid var(--border-subtle)' }}>Configure</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
