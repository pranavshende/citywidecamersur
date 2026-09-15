import { useState, useEffect } from 'react';
import { Database, Loader2, Cpu, MemoryStick } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface EdgeNode {
  id: string;
  name: string;
  location_name: string;
  status: string;
  cpu_usage: number;
  gpu_usage: number;
  fps: number;
  cameras: any[];
}

export default function EdgeNodes() {
  const [nodes, setNodes] = useState<EdgeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await apiFetch<{ data: EdgeNode[] }>('/api/system/edge-nodes');
        setNodes(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNodes();
    // Refresh every 5s for live status updates
    const int = setInterval(fetchNodes, 5000);
    return () => clearInterval(int);
  }, []);

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Database className="text-cyan" /> Edge Processing Nodes
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Distributed ML inference infrastructure health</p>
        </div>
        <div className="flex gap-4">
          <div className="panel px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="font-bold">{nodes.filter(n => n.status === 'online').length} Online</span>
          </div>
          <div className="panel px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-bold text-rose-500">{nodes.filter(n => n.status === 'offline').length} Offline</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-cyan"><Loader2 className="animate-spin" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: 16 }}>
          {nodes.map(node => (
            <div key={node.id} className="panel" style={{ padding: 20 }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="mono font-bold text-lg">{node.id}</div>
                  <div className="text-sm text-secondary">{node.location_name}</div>
                </div>
                <span className="badge" style={{ 
                  background: node.status === 'online' ? 'var(--accent-cyan-dim)' : 'var(--accent-rose-dim)', 
                  color: node.status === 'online' ? 'var(--accent-cyan)' : 'var(--accent-rose)' 
                }}>
                  {node.status.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-secondary mb-4">
                <div className="panel p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2"><Cpu size={14} className="text-cyan" /> CPU</div>
                  <div className="text-lg font-bold text-primary">{node.cpu_usage.toFixed(1)}%</div>
                </div>
                <div className="panel p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2"><MemoryStick size={14} className="text-amber" /> GPU</div>
                  <div className="text-lg font-bold text-primary">{node.gpu_usage.toFixed(1)}%</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-sm text-secondary">
                <div className="flex justify-between">
                  <span>Connected Cameras</span>
                  <span className="font-bold">{node.cameras?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Throughput</span>
                  <span className="font-bold">{node.fps.toFixed(1)} FPS</span>
                </div>
              </div>

              <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button className="btn text-xs" style={{ background: 'var(--bg-tertiary)' }}>Reboot Node</button>
                <button className="btn text-xs" style={{ background: 'transparent', border: '1px solid var(--border-subtle)' }}>View Logs</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
