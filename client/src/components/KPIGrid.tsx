import { useEffect, useState } from 'react';
import { Car, Users, AlertTriangle, Video, Zap } from 'lucide-react';

interface KPIData {
  total_detections: number;
  unique_vehicles: number;
  active_alerts: number;
  total_cameras: number;
  online_cameras: number;
  avg_processing_ms: number;
}

export default function KPIGrid() {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fallback for dev proxy or env var
        const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/dashboard/kpi`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error('Failed to load KPIs', e);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
    // Refresh every 10 seconds
    const interval = setInterval(fetchKPIs, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', gap: 16, padding: '16px 24px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="panel" style={{ flex: 1, height: 86, background: 'var(--bg-tertiary)' }} />
        ))}
      </div>
    );
  }

  const kpis = [
    { title: 'Total Plates Detected', value: formatNumber(data.total_detections), icon: <Car size={24} className="text-cyan" />, bg: 'var(--accent-cyan-dim)' },
    { title: 'Unique Vehicles', value: formatNumber(data.unique_vehicles), icon: <Users size={24} className="text-cyan" />, bg: 'var(--accent-cyan-dim)' },
    { title: 'Active Alerts', value: formatNumber(data.active_alerts), icon: <AlertTriangle size={24} className="text-rose" />, bg: 'var(--accent-rose-dim)' },
    { title: 'Active Cameras', value: `${data.online_cameras} / ${data.total_cameras}`, icon: <Video size={24} className="text-emerald" />, bg: 'var(--accent-emerald-dim)' },
    { title: 'Avg. Processing Time', value: `${data.avg_processing_ms} ms`, icon: <Zap size={24} className="text-amber" />, bg: 'var(--accent-amber-dim)' },
  ];

  return (
    <div style={{ display: 'flex', gap: 16, padding: '16px 24px', zIndex: 10 }}>
      {kpis.map((kpi, idx) => (
        <div key={idx} className="panel" style={{ flex: 1, padding: '16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {kpi.icon}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{kpi.title}</div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{kpi.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Live data</div>
          </div>
        </div>
      ))}
    </div>
  );
}
