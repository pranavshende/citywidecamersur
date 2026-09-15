import { useState, useEffect } from 'react';
import { ShieldAlert, Loader2, Filter } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface Alert {
  id: string;
  severity: string;
  alert_type: string;
  plate?: string;
  status: string;
  created_at: string;
  camera?: { name: string, location_name: string };
  edge_node?: { name: string };
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAlerts = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data: Alert[], totalPages: number }>(`/api/alerts?page=${p}&limit=15`);
      setAlerts(res.data);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(page);
  }, [page]);

  const severityColor = (sev: string) => {
    if (sev === 'critical') return 'var(--accent-rose)';
    if (sev === 'high') return 'var(--accent-amber)';
    return 'var(--text-secondary)';
  };

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldAlert className="text-rose" /> Alerts & Watchlist
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Historical log of all system and detection alerts</p>
        </div>
      </div>

      <div className="panel flex-1 flex-col min-h-0">
        <div className="panel-header flex justify-between items-center">
          <span>Alert History</span>
          <button className="btn" style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            <Filter size={16} /> Filter
          </button>
        </div>
        <div className="panel-content" style={{ overflowY: 'auto', padding: 0 }}>
          {loading ? (
            <div className="p-12 flex justify-center text-cyan"><Loader2 className="animate-spin" /></div>
          ) : alerts.length === 0 ? (
            <div className="p-12 text-center text-muted">No alerts found.</div>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
                  <th className="p-4 font-semibold text-secondary text-sm">Timestamp</th>
                  <th className="p-4 font-semibold text-secondary text-sm">Severity</th>
                  <th className="p-4 font-semibold text-secondary text-sm">Alert Type</th>
                  <th className="p-4 font-semibold text-secondary text-sm">Target / Plate</th>
                  <th className="p-4 font-semibold text-secondary text-sm">Location</th>
                  <th className="p-4 font-semibold text-secondary text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="p-4 text-sm mono text-secondary">{new Date(a.created_at).toLocaleString()}</td>
                    <td className="p-4 text-sm font-bold" style={{ color: severityColor(a.severity) }}>
                      {a.severity.toUpperCase()}
                    </td>
                    <td className="p-4 text-sm">{a.alert_type}</td>
                    <td className="p-4 text-sm mono font-bold">{a.plate || 'N/A'}</td>
                    <td className="p-4 text-sm text-secondary">
                      {a.camera?.name || a.edge_node?.name || 'System'}
                    </td>
                    <td className="p-4">
                      <span className="badge" style={{ background: a.status === 'active' ? 'var(--accent-rose-dim)' : 'var(--bg-tertiary)', color: a.status === 'active' ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination controls */}
        <div className="p-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button 
            className="btn" 
            disabled={page === 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{ background: 'var(--bg-tertiary)' }}
          >
            Previous
          </button>
          <span className="text-sm text-secondary">Page {page} of {totalPages}</span>
          <button 
            className="btn" 
            disabled={page >= totalPages} 
            onClick={() => setPage(p => p + 1)}
            style={{ background: 'var(--bg-tertiary)' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
