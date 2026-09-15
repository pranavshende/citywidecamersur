import { Settings as SettingsIcon, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
            <SettingsIcon className="text-secondary" /> System Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure user preferences and global system defaults</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-4xl">
        <div className="panel p-6">
          <h2 className="text-lg font-bold mb-4 border-b border-[var(--border-subtle)] pb-2">Profile</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-secondary block mb-1">Full Name</label>
              <input type="text" disabled value={user?.full_name || ''} className="w-full p-2 rounded bg-[rgba(255,255,255,0.05)] border border-[var(--border-subtle)] text-white" />
            </div>
            <div>
              <label className="text-xs text-secondary block mb-1">Badge Number</label>
              <input type="text" disabled value={user?.badge_number || ''} className="w-full p-2 rounded bg-[rgba(255,255,255,0.05)] border border-[var(--border-subtle)] text-white" />
            </div>
            <div>
              <label className="text-xs text-secondary block mb-1">Role</label>
              <input type="text" disabled value={user?.role || ''} className="w-full p-2 rounded bg-[rgba(255,255,255,0.05)] border border-[var(--border-subtle)] text-white uppercase" />
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="text-lg font-bold mb-4 border-b border-[var(--border-subtle)] pb-2">Notifications</h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-cyan" />
              <span>Enable Audio Alerts for Critical Detections</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-cyan" />
              <span>Desktop Push Notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="accent-cyan" />
              <span>Email Digest (End of Shift)</span>
            </label>
          </div>

          <div className="mt-8 flex justify-end">
            <button className="btn" style={{ background: 'var(--accent-cyan)', color: 'black', fontWeight: 600 }}>
              <Save size={16} className="inline mr-2" /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
