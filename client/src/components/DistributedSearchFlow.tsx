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

  const getEdgeOpacity = (step: number) => activeStep >= step ? 1 : 0.3;
  const getEdgeAnimation = (step: number) => activeStep === step ? 'animate-pulse' : '';

  return (
    <div className="panel flex flex-col h-full" style={{ padding: 20 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold">How Vehicle Search Works</h2>
          <p className="text-xs text-secondary">Real-time distributed search across city infrastructure</p>
        </div>
      </div>

      {/* Process Steps Legend */}
      <div className="flex gap-4 mb-8 text-[0.65rem]">
        <div className={`flex items-center gap-2 ${activeStep >= 1 ? 'text-primary' : 'text-secondary opacity-50'}`}>
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">1</div>
          <div><div className="font-bold">Search Request</div><div>User searches vehicle</div></div>
        </div>
        <div className={`flex items-center gap-2 ${activeStep >= 2 ? 'text-primary' : 'text-secondary opacity-50'}`}>
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">2</div>
          <div><div className="font-bold">Coordinator</div><div>Distributes request</div></div>
        </div>
        <div className={`flex items-center gap-2 ${activeStep >= 3 ? 'text-primary' : 'text-secondary opacity-50'}`}>
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">3</div>
          <div><div className="font-bold">Parallel Nodes</div><div>Query edges simultaneously</div></div>
        </div>
        <div className={`flex items-center gap-2 ${activeStep >= 4 ? 'text-primary' : 'text-secondary opacity-50'}`}>
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">4</div>
          <div><div className="font-bold">Cameras</div><div>Each queries cameras</div></div>
        </div>
        <div className={`flex items-center gap-2 ${activeStep >= 5 ? 'text-primary' : 'text-secondary opacity-50'}`}>
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">5</div>
          <div><div className="font-bold">Aggregation</div><div>Deduplicated & mapped</div></div>
        </div>
      </div>

      {/* Animated Diagram */}
      <div className="flex items-center justify-between flex-1 px-4">
        
        {/* User Search */}
        <div className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${getEdgeOpacity(1)}`}>
          <div className={`w-16 h-16 rounded-full border-2 border-cyan flex items-center justify-center bg-[rgba(6,182,212,0.1)] ${getEdgeAnimation(1)}`}>
            <SearchIcon className="text-cyan" size={24} />
          </div>
          <div className="text-xs text-center">
            <div className="font-bold">Vehicle Search</div>
            <div className="text-cyan mono">{plate}</div>
          </div>
        </div>

        {/* Arrow */}
        <div className={`h-[2px] flex-1 bg-gradient-to-r from-cyan-500 to-indigo-500 mx-2 transition-opacity duration-500 ${getEdgeOpacity(2)} relative`}>
          {activeStep === 1 && <div className="absolute top-[-4px] left-0 w-2 h-2 rounded-full bg-white animate-[slideRight_0.5s_linear_forwards]" />}
        </div>

        {/* Coordinator */}
        <div className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${getEdgeOpacity(2)}`}>
          <div className={`w-20 h-20 rounded-xl border-2 border-indigo-500 flex items-center justify-center bg-[rgba(99,102,241,0.1)] ${getEdgeAnimation(2)}`}>
            <Database className="text-indigo-400" size={32} />
          </div>
          <div className="text-xs text-center">
            <div className="font-bold text-indigo-400">Coordinator</div>
            <div className="text-secondary scale-90">Distributes search</div>
          </div>
        </div>

        {/* Forked Arrows */}
        <div className="relative h-40 w-16 flex flex-col justify-between items-center mx-2 py-4">
          <div className={`absolute left-0 w-full h-[2px] top-6 bg-gradient-to-r from-indigo-500 to-emerald-500 transition-opacity duration-500 ${getEdgeOpacity(3)}`} />
          <div className={`absolute left-0 w-full h-[2px] top-1/2 bg-gradient-to-r from-indigo-500 to-emerald-500 transition-opacity duration-500 ${getEdgeOpacity(3)}`} />
          <div className={`absolute left-0 w-full h-[2px] bottom-6 bg-gradient-to-r from-indigo-500 to-emerald-500 transition-opacity duration-500 ${getEdgeOpacity(3)}`} />
          <div className={`absolute left-0 w-[2px] h-[calc(100%-48px)] top-6 bg-indigo-500 transition-opacity duration-500 ${getEdgeOpacity(3)}`} />
        </div>

        {/* Edge Nodes & Cameras Column */}
        <div className="flex flex-col gap-6 justify-between h-56">
          {nodes.map((node, i) => (
            <div key={i} className={`flex items-center gap-4 transition-opacity duration-500 ${getEdgeOpacity(3)} delay-[${i * 100}ms]`}>
              <div className={`flex items-center gap-3 border border-emerald-500/50 rounded-lg p-2 bg-[rgba(16,185,129,0.05)] w-36 ${getEdgeAnimation(3)}`}>
                <Server size={16} className="text-emerald-400" />
                <div className="text-[0.65rem] leading-tight">
                  <div className="font-bold text-emerald-400">{node.id}</div>
                  <div className="text-secondary">({node.zone})</div>
                </div>
              </div>
              <ChevronRight size={14} className={`text-emerald-500/50 ${getEdgeOpacity(4)}`} />
              <div className={`flex items-center gap-2 border border-blue-500/50 rounded-lg p-2 bg-[rgba(59,130,246,0.05)] w-28 transition-opacity duration-500 ${getEdgeOpacity(4)} delay-[${200 + i * 100}ms] ${getEdgeAnimation(4)}`}>
                <Video size={14} className="text-blue-400" />
                <div className="text-[0.65rem] leading-tight">
                  <div className="font-bold text-blue-400">Cameras</div>
                  <div className="text-secondary">({node.cameras})</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Merged Arrows */}
        <div className="relative h-40 w-16 flex flex-col justify-between items-center mx-2 py-4">
          <div className={`absolute right-0 w-full h-[2px] top-6 bg-gradient-to-r from-blue-500 to-emerald-400 transition-opacity duration-500 ${getEdgeOpacity(5)}`} />
          <div className={`absolute right-0 w-full h-[2px] top-1/2 bg-gradient-to-r from-blue-500 to-emerald-400 transition-opacity duration-500 ${getEdgeOpacity(5)}`} />
          <div className={`absolute right-0 w-full h-[2px] bottom-6 bg-gradient-to-r from-blue-500 to-emerald-400 transition-opacity duration-500 ${getEdgeOpacity(5)}`} />
          <div className={`absolute right-0 w-[2px] h-[calc(100%-48px)] top-6 bg-emerald-400 transition-opacity duration-500 ${getEdgeOpacity(5)}`} />
        </div>

        {/* Final Result */}
        <div className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${getEdgeOpacity(5)} delay-300`}>
          <div className={`w-24 h-24 rounded-xl border-2 border-emerald-400 flex items-center justify-center bg-[rgba(16,185,129,0.1)] ${getEdgeAnimation(5)}`}>
            <Database className="text-emerald-400" size={32} />
          </div>
          <div className="text-[0.65rem] text-center w-28">
            <div className="font-bold text-emerald-400 text-xs mb-1">Aggregated Results</div>
            <div className="text-secondary">Deduplicated, sorted & mapped on GIS</div>
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
