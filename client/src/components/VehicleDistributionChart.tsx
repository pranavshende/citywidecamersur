import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface DistData {
  name: string;
  value: number;
}

const COLORS = ['#05d5fa', '#10b981', '#6366f1', '#f59e0b', '#f43f5e', '#8b949e'];

export default function VehicleDistributionChart() {
  const [data, setData] = useState<DistData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDist = async () => {
      try {
        const json = await apiFetch<DistData[]>('/api/dashboard/distribution');
        setData(json);
      } catch (e) {
        console.error('Failed to load distribution', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDist();
    const interval = setInterval(fetchDist, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem' }}>
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: entry.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="panel h-full flex flex-col" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header">
        <PieChartIcon size={16} className="text-emerald" /> Vehicle Distribution
      </div>
      <div className="panel-content" style={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Loading distribution...
          </div>
        ) : data.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <PieChart>
              <Pie
                data={data}
                cx="40%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: '0.8rem' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Legend content={renderLegend} layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
