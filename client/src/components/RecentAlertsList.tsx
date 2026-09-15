import { useEffect, useState } from 'react';
import { ChevronRight, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiFetch } from '../lib/api';

interface Alert {
  id: string;
  severity: string;
  alert_type: string;
  plate: string;
  camera: { location_name: string };
  created_at: string;
}

export default function RecentAlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const json = await apiFetch<Alert[]>('/api/alerts/recent');
      setAlerts(json);
    } catch (e) {
      console.error('Failed to load alerts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time WebSocket alerts
  useEffect(() => {
    const wsListener = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === 'alert:new') {
          fetchAlerts();
        }
      } catch (e) {}
    };
    
    // Minimal mock for adding a listener if we had the raw socket
    // Window doesn't naturally emit MessageEvent unless mapped
    window.addEventListener('message', wsListener);
    return () => window.removeEventListener('message', wsListener);
  }, []);

  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return { bg: 'var(--accent-rose)', label: 'Critical' };
      case 'high': return { bg: 'var(--accent-rose)', label: 'High' };
      case 'medium': return { bg: 'var(--accent-amber)', label: 'Medium' };
      case 'low': return { bg: 'var(--accent-cyan)', label: 'Low' };
      default: return { bg: 'var(--text-muted)', label: 'Info' };
    }
  };

  return (
    <div className="panel h-full flex flex-col" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={16} className="text-rose" /> Recent Alerts
        </div>
        <a href="/alerts" style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          View All <ChevronRight size={12} />
        </a>
      </div>
      <div className="panel-content" style={{ flex: 1, padding: '12px 16px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No recent alerts</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alerts.map(alert => {
              const sev = getSeverityStyle(alert.severity);
              return (
                <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ 
                    padding: '2px 8px', 
                    borderRadius: 12, 
                    fontSize: '0.6rem', 
                    fontWeight: 800, 
                    textTransform: 'uppercase',
                    color: '#fff',
                    background: sev.bg,
                    width: 50,
                    textAlign: 'center'
                  }}>
                    {sev.label}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{alert.alert_type}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{alert.camera?.location_name || 'Unknown Location'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{alert.plate}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
