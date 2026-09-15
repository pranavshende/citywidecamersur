import { useState, useEffect } from 'react';
import { Server, Database, Video, ChevronRight } from 'lucide-react';

interface Props {
  status: 'idle' | 'searching' | 'aggregating' | 'complete';
  plate: string;
}

export default function DistributedSearchFlow({ status, plate }: Props) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (status === 'idle') setActiveStep(0);
    else if (status === 'searching') {
      setActiveStep(1);
      const t1 = setTimeout(() => setActiveStep(2), 500);
      const t2 = setTimeout(() => setActiveStep(3), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    else if (status === 'aggregating') setActiveStep(4);
    else if (status === 'complete') setActiveStep(5);
  }, [status]);

  const nodes = [
    { id: 'Edge Node 01', zone: 'Zone A', cameras: 4 },
    { id: 'Edge Node 02', zone: 'Zone B', cameras: 5 },
    { id: 'Edge Node 03', zone: 'Zone C', cameras: 3 }
  ];

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>How Vehicle Search Works</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Real-time distributed search across city infrastructure</p>
        </div>
      </div>

      {/* Process Steps Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, fontSize: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: activeStep >= 1 ? 'var(--text-primary)' : 'var(--text-secondary)', opacity: activeStep >= 1 ? 1 : 0.5 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>1</div>
          <div><div style={{ fontWeight: 700 }}>Search Request</div><div>User searches vehicle</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: activeStep >= 2 ? 'var(--text-primary)' : 'var(--text-secondary)', opacity: activeStep >= 2 ? 1 : 0.5 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>2</div>
          <div><div style={{ fontWeight: 700 }}>Coordinator</div><div>Distributes request</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: activeStep >= 3 ? 'var(--text-primary)' : 'var(--text-secondary)', opacity: activeStep >= 3 ? 1 : 0.5 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>3</div>
          <div><div style={{ fontWeight: 700 }}>Parallel Nodes</div><div>Query edges simultaneously</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: activeStep >= 4 ? 'var(--text-primary)' : 'var(--text-secondary)', opacity: activeStep >= 4 ? 1 : 0.5 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>4</div>
          <div><div style={{ fontWeight: 700 }}>Cameras</div><div>Each queries cameras</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: activeStep >= 5 ? 'var(--text-primary)' : 'var(--text-secondary)', opacity: activeStep >= 5 ? 1 : 0.5 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>5</div>
          <div><div style={{ fontWeight: 700 }}>Aggregation</div><div>Deduplicated & mapped</div></div>
        </div>
      </div>

      {/* Animated Diagram */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, padding: '0 16px' }}>
        
        {/* User Search */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: getEdgeOpacity(1), transition: 'opacity 0.5s' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,182,212,0.1)', animation: activeStep === 1 ? 'pulse 2s infinite' : 'none' }}>
            <SearchIcon color="var(--accent-cyan)" size={24} />
          </div>
          <div style={{ fontSize: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>Vehicle Search</div>
            <div style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{plate}</div>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ height: 2, flex: 1, background: 'linear-gradient(to right, #06b6d4, #6366f1)', margin: '0 8px', opacity: getEdgeOpacity(2), transition: 'opacity 0.5s', position: 'relative' }}>
        </div>

        {/* Coordinator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: getEdgeOpacity(2), transition: 'opacity 0.5s' }}>
          <div style={{ width: 80, height: 80, borderRadius: 12, border: '2px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.1)', animation: activeStep === 2 ? 'pulse 2s infinite' : 'none' }}>
            <Database color="#818cf8" size={32} />
          </div>
          <div style={{ fontSize: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: '#818cf8' }}>Coordinator</div>
            <div style={{ color: 'var(--text-secondary)', transform: 'scale(0.9)' }}>Distributes search</div>
          </div>
        </div>

        {/* Forked Arrows */}
        <div style={{ position: 'relative', height: 160, width: 64, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', margin: '0 8px', padding: '16px 0' }}>
          <div style={{ position: 'absolute', left: 0, width: '100%', height: 2, top: 24, background: 'linear-gradient(to right, #6366f1, #10b981)', opacity: getEdgeOpacity(3), transition: 'opacity 0.5s' }}></div>
          <div style={{ position: 'absolute', left: 0, width: '100%', height: 2, top: '50%', background: 'linear-gradient(to right, #6366f1, #10b981)', opacity: getEdgeOpacity(3), transition: 'opacity 0.5s' }}></div>
          <div style={{ position: 'absolute', left: 0, width: '100%', height: 2, bottom: 24, background: 'linear-gradient(to right, #6366f1, #10b981)', opacity: getEdgeOpacity(3), transition: 'opacity 0.5s' }}></div>
          <div style={{ position: 'absolute', left: 0, width: 2, height: 'calc(100% - 48px)', top: 24, background: '#6366f1', opacity: getEdgeOpacity(3), transition: 'opacity 0.5s' }}></div>
        </div>

        {/* Edge Nodes & Cameras Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'space-between', height: 224 }}>
          {nodes.map((node, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: getEdgeOpacity(3), transition: 'opacity 0.5s', transitionDelay: `${i * 100}ms` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(16,185,129,0.5)', borderRadius: 8, padding: 8, background: 'rgba(16,185,129,0.05)', width: 144, animation: activeStep === 3 ? 'pulse 2s infinite' : 'none' }}>
                <Server size={16} color="#34d399" />
                <div style={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 700, color: '#34d399' }}>{node.id}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>({node.zone})</div>
                </div>
              </div>
              <ChevronRight size={14} color="rgba(16,185,129,0.5)" style={{ opacity: getEdgeOpacity(4) }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(59,130,246,0.5)', borderRadius: 8, padding: 8, background: 'rgba(59,130,246,0.05)', width: 112, opacity: getEdgeOpacity(4), transition: 'opacity 0.5s', transitionDelay: `${200 + i * 100}ms`, animation: activeStep === 4 ? 'pulse 2s infinite' : 'none' }}>
                <Video size={14} color="#60a5fa" />
                <div style={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 700, color: '#60a5fa' }}>Cameras</div>
                  <div style={{ color: 'var(--text-secondary)' }}>({node.cameras})</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Merged Arrows */}
        <div style={{ position: 'relative', height: 160, width: 64, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', margin: '0 8px', padding: '16px 0' }}>
          <div style={{ position: 'absolute', right: 0, width: '100%', height: 2, top: 24, background: 'linear-gradient(to right, #3b82f6, #34d399)', opacity: getEdgeOpacity(5), transition: 'opacity 0.5s' }}></div>
          <div style={{ position: 'absolute', right: 0, width: '100%', height: 2, top: '50%', background: 'linear-gradient(to right, #3b82f6, #34d399)', opacity: getEdgeOpacity(5), transition: 'opacity 0.5s' }}></div>
          <div style={{ position: 'absolute', right: 0, width: '100%', height: 2, bottom: 24, background: 'linear-gradient(to right, #3b82f6, #34d399)', opacity: getEdgeOpacity(5), transition: 'opacity 0.5s' }}></div>
          <div style={{ position: 'absolute', right: 0, width: 2, height: 'calc(100% - 48px)', top: 24, background: '#34d399', opacity: getEdgeOpacity(5), transition: 'opacity 0.5s' }}></div>
        </div>

        {/* Final Result */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: getEdgeOpacity(5), transition: 'opacity 0.5s', transitionDelay: '300ms' }}>
          <div style={{ width: 96, height: 96, borderRadius: 12, border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.1)', animation: activeStep === 5 ? 'pulse 2s infinite' : 'none' }}>
            <Database color="#34d399" size={32} />
          </div>
          <div style={{ fontSize: '0.65rem', textAlign: 'center', width: 112 }}>
            <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.75rem', marginBottom: 4 }}>Aggregated Results</div>
            <div style={{ color: 'var(--text-secondary)' }}>Deduplicated, sorted & mapped on GIS</div>
          </div>
        </div>

      </div>
    </div>
  );
}

const SearchIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
