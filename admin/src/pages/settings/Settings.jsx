import React, { useState, useEffect } from 'react';
import { Save, Server, Database, Cpu } from 'lucide-react';
import { settingsAPI } from '../../services/api';
import { toast } from 'sonner';

const INPUT_CLS = 'w-full bg-admin-elevated border border-admin-border rounded-md px-3 py-2.5 text-sm text-admin-text-1 placeholder-admin-text-3 outline-none focus:border-admin-border-alt transition-colors';
const LABEL_CLS = 'block text-sm text-admin-text-2 mb-1.5';

const Settings = () => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteName: 'GoPilot',
    supportEmail: '',
    currency: 'USD',
    commissionRate: '15',
    minBookingHours: '1',
    maxBookingHours: '24',
    cancellationHours: '2',
  });

  useEffect(() => {
    settingsAPI.getSystemInfo()
      .then(res => setSystemInfo(res.data.data))
      .catch(() => {}); // non-critical
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update(form);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-admin-text-1">Settings</h1>
        <p className="text-sm text-admin-text-3 mt-0.5">Platform configuration</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General */}
        <Section title="General">
          <Field label="Platform Name">
            <input className={INPUT_CLS} value={form.siteName} onChange={e => set('siteName', e.target.value)} placeholder="GoPilot" />
          </Field>
          <Field label="Support Email">
            <input className={INPUT_CLS} type="email" value={form.supportEmail} onChange={e => set('supportEmail', e.target.value)} placeholder="support@gopilot.app" />
          </Field>
          <Field label="Currency">
            <select className={INPUT_CLS} value={form.currency} onChange={e => set('currency', e.target.value)}>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="INR">INR — Indian Rupee</option>
              <option value="GBP">GBP — British Pound</option>
            </select>
          </Field>
          <Field label="Platform Commission (%)">
            <input className={INPUT_CLS} type="number" min="0" max="100" value={form.commissionRate} onChange={e => set('commissionRate', e.target.value)} />
          </Field>
        </Section>

        {/* Booking */}
        <Section title="Booking Rules">
          <Field label="Minimum Booking Duration (hours)">
            <input className={INPUT_CLS} type="number" min="0.5" step="0.5" value={form.minBookingHours} onChange={e => set('minBookingHours', e.target.value)} />
          </Field>
          <Field label="Maximum Booking Duration (hours)">
            <input className={INPUT_CLS} type="number" min="1" value={form.maxBookingHours} onChange={e => set('maxBookingHours', e.target.value)} />
          </Field>
          <Field label="Free Cancellation Window (hours before start)">
            <input className={INPUT_CLS} type="number" min="0" value={form.cancellationHours} onChange={e => set('cancellationHours', e.target.value)} />
          </Field>
        </Section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-admin-accent hover:bg-admin-accent-dim text-white rounded-md px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* System Info */}
      {systemInfo && (
        <div className="bg-admin-surface border border-admin-border rounded-md p-6 space-y-4">
          <h2 className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest">System Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoCard icon={Database} label="Database" items={[
              ['Users', systemInfo.database?.totalUsers],
              ['Drivers', systemInfo.database?.totalDrivers],
              ['Bookings', systemInfo.database?.totalBookings],
              ['Pending Drivers', systemInfo.database?.pendingDrivers],
            ]} />
            <InfoCard icon={Server} label="Server" items={[
              ['Node', systemInfo.server?.nodeVersion],
              ['Platform', systemInfo.server?.platform],
              ['Uptime', systemInfo.server?.uptime ? `${Math.floor(systemInfo.server.uptime / 60)}m` : '—'],
            ]} />
            <InfoCard icon={Cpu} label="Application" items={[
              ['Version', systemInfo.application?.version],
              ['Environment', systemInfo.application?.environment],
            ]} />
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-admin-surface border border-admin-border rounded-md p-6 space-y-4">
    <h2 className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className={LABEL_CLS}>{label}</label>
    {children}
  </div>
);

const InfoCard = ({ icon: Icon, label, items }) => (
  <div className="bg-admin-elevated border border-admin-border rounded-md p-4">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-admin-text-3" />
      <span className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest">{label}</span>
    </div>
    <div className="space-y-1.5">
      {items.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between">
          <span className="text-xs text-admin-text-3">{k}</span>
          <span className="text-xs font-mono text-admin-text-1">{v ?? '—'}</span>
        </div>
      ))}
    </div>
  </div>
);

export default Settings;
