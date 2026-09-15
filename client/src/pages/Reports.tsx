import { FileText, Download } from 'lucide-react';

export default function Reports() {
  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileText className="text-amber" /> Reports & Exports
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Generate compliance and operational reports</p>
        </div>
      </div>

      <div className="panel p-6 max-w-2xl">
        <h2 className="text-lg font-bold mb-4">Generate End-of-Shift Report</h2>
        <div className="flex gap-4 mb-6">
          <select className="p-2 rounded bg-[rgba(0,0,0,0.2)] border border-[var(--border-subtle)] text-white w-full">
            <option>Last 12 Hours</option>
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
          </select>
          <button className="btn whitespace-nowrap" style={{ background: 'var(--accent-amber)', color: 'black', fontWeight: 600 }}>
            <Download size={16} className="inline mr-2" />
            Export PDF
          </button>
        </div>

        <h2 className="text-lg font-bold mb-4 border-t border-[var(--border-subtle)] pt-6">Recent Reports</h2>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between p-3 bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] rounded hover:bg-[rgba(255,255,255,0.05)] cursor-pointer">
            <div>
              <div className="font-bold">Daily Traffic Summary</div>
              <div className="text-xs text-secondary mt-1">Generated: Today, 08:00 AM</div>
            </div>
            <button className="text-cyan"><Download size={16} /></button>
          </div>
          <div className="flex justify-between p-3 bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] rounded hover:bg-[rgba(255,255,255,0.05)] cursor-pointer">
            <div>
              <div className="font-bold">Alert Escalations (Weekly)</div>
              <div className="text-xs text-secondary mt-1">Generated: Monday, 09:00 AM</div>
            </div>
            <button className="text-cyan"><Download size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
