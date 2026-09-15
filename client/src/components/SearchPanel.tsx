import { useState } from 'react';
import { Search, CarFront, Hash, Palette } from 'lucide-react';
import { submitQuery } from '../services/api';

export default function SearchPanel() {
  const [plate, setPlate] = useState('MH12AB1234'); // Default for demo
  const [color, setColor] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitQuery({ plate, vehicle_color: color, vehicle_type: type });
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel">
      <div className="glass-header">
        <span className="glass-title"><Search size={14} className="text-cyan" /> Target Query Parameter</span>
      </div>
      
      <form onSubmit={handleSearch} style={{ padding: 16 }}>
        <div className="flex-col gap-3">
          <div className="relative">
            <label className="label">License Plate</label>
            <div className="relative">
              <Hash size={16} style={{ position: 'absolute', top: 12, left: 12, color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input mono"
                style={{ paddingLeft: 36, textTransform: 'uppercase' }}
                placeholder="MH12AB..."
                value={plate}
                onChange={e => setPlate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <label className="label">Color</label>
              <div className="relative">
                <Palette size={16} style={{ position: 'absolute', top: 12, left: 12, color: 'var(--text-muted)' }} />
                <select
                  className="select"
                  style={{ paddingLeft: 36 }}
                  value={color}
                  onChange={e => setColor(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                  <option value="silver">Silver</option>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                </select>
              </div>
            </div>

            <div className="flex-1 relative">
              <label className="label">Type</label>
              <div className="relative">
                <CarFront size={16} style={{ position: 'absolute', top: 12, left: 12, color: 'var(--text-muted)' }} />
                <select
                  className="select"
                  style={{ paddingLeft: 36 }}
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="hatchback">Hatchback</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && <div style={{ color: 'var(--accent-rose)', fontSize: '0.75rem', marginTop: 12 }}>{error}</div>}

        <button
          type="submit"
          className="btn btn-primary w-full"
          style={{ marginTop: 16 }}
          disabled={loading || (!plate && !color && !type)}
        >
          {loading ? <Search size={16} className="spin" /> : <Search size={16} />}
          INITIALIZE GLOBAL SEARCH
        </button>
      </form>
    </div>
  );
}
