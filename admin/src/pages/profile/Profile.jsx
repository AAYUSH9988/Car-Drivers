import React, { useState, useContext, useEffect } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { profileAPI } from '../../services/api';
import { toast } from 'sonner';

const INPUT_CLS = 'w-full bg-admin-elevated border border-admin-border rounded-md px-3 py-2.5 text-sm text-admin-text-1 placeholder-admin-text-3 outline-none focus:border-admin-border-alt transition-colors';
const LABEL_CLS = 'block text-sm text-admin-text-2 mb-1.5';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await profileAPI.update({ name: profileForm.name, phone: profileForm.phone });
      const updated = res.data.data;
      const stored = JSON.parse(localStorage.getItem('admin_user') || '{}');
      localStorage.setItem('admin_user', JSON.stringify({ ...stored, name: updated.name, phone: updated.phone }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await profileAPI.update({ currentPassword, newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold text-admin-text-1">Profile</h1>
        <p className="text-sm text-admin-text-3 mt-0.5">Manage your admin account</p>
      </div>

      {/* Avatar */}
      <div className="bg-admin-surface border border-admin-border rounded-md p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-admin-accent/20 flex items-center justify-center text-xl font-semibold text-admin-accent">
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div>
          <p className="text-base font-semibold text-admin-text-1">{user?.name || 'Admin'}</p>
          <p className="text-sm text-admin-text-3">{user?.email}</p>
          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-2xs font-medium bg-violet-400/10 text-violet-400 uppercase tracking-wide">
            Administrator
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-admin-border">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors relative ${
              activeTab === t.key ? 'text-admin-accent' : 'text-admin-text-3 hover:text-admin-text-2'
            }`}
          >
            <t.icon size={14} />
            {t.label}
            {activeTab === t.key && <span className="absolute bottom-0 left-0 right-0 h-px bg-admin-accent" />}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="bg-admin-surface border border-admin-border rounded-md p-6 space-y-4">
          <div>
            <label className={LABEL_CLS}>Full Name</label>
            <input
              className={INPUT_CLS}
              value={profileForm.name}
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Email Address</label>
            <input className={`${INPUT_CLS} opacity-50 cursor-not-allowed`} value={profileForm.email} disabled />
            <p className="text-xs text-admin-text-3 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className={LABEL_CLS}>Phone</label>
            <input
              className={INPUT_CLS}
              type="tel"
              value={profileForm.phone}
              onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Enter phone number"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-admin-accent hover:bg-admin-accent-dim text-white rounded-md px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSave} className="bg-admin-surface border border-admin-border rounded-md p-6 space-y-4">
          <div>
            <label className={LABEL_CLS}>Current Password</label>
            <input
              className={INPUT_CLS}
              type={showPass ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
              required
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className={LABEL_CLS}>New Password</label>
            <input
              className={INPUT_CLS}
              type={showPass ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
              required
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Confirm New Password</label>
            <input
              className={INPUT_CLS}
              type={showPass ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
              required
              placeholder="Repeat new password"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPass}
              onChange={e => setShowPass(e.target.checked)}
              className="w-4 h-4 rounded border-admin-border bg-admin-elevated text-admin-accent"
            />
            <span className="text-sm text-admin-text-2">Show passwords</span>
          </label>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-admin-accent hover:bg-admin-accent-dim text-white rounded-md px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Lock size={16} />
              {saving ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;
