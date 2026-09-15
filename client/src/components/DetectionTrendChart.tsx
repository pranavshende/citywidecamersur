import { useEffect, useState } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity } from 'lucide-react';

interface TrendData {
  time: string;
  detections: number;
}

export default function DetectionTrendChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/dashboard/trends`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error('Failed to load trends', e);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
    const interval = setInterval(fetchTrends, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel h-full flex flex-col" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header">
        <Activity size={16} className="text-cyan" /> Detection Trend (24h)
      </div>
      <div className="panel-content" style={{ flex: 1, padding: '16px 16px 0 0', position: 'relative' }}>
        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Loading trends...
          </div>
        ) : data.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No detection data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="var(--border-strong)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickMargin={10} minTickGap={30} />
              <YAxis stroke="var(--border-strong)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: '0.8rem' }}
                itemStyle={{ color: 'var(--accent-cyan)' }}
              />
              <Area type="monotone" dataKey="detections" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorDetections)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
