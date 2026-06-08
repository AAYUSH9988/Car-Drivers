import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { userAPI } from '../../services/api';
import { toast } from 'sonner';

const INPUT_CLS = 'w-full bg-admin-elevated border border-admin-border rounded-md px-3 py-2.5 text-sm text-admin-text-1 placeholder-admin-text-3 outline-none focus:border-admin-border-alt transition-colors';
const LABEL_CLS = 'block text-sm text-admin-text-2 mb-1.5';

const AddUser = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      await userAPI.create(form);
      toast.success('User created successfully');
      navigate('/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/users')} className="p-2 text-admin-text-3 hover:text-admin-text-1 hover:bg-admin-elevated rounded-md transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-admin-text-1">Add User</h1>
          <p className="text-sm text-admin-text-3 mt-0.5">Create a new user account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-admin-surface border border-admin-border rounded-md p-6 space-y-4">
        <div>
          <label className={LABEL_CLS}>Full Name <span className="text-red-400">*</span></label>
          <input className={INPUT_CLS} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="John Doe" />
        </div>
        <div>
          <label className={LABEL_CLS}>Email Address <span className="text-red-400">*</span></label>
          <input className={INPUT_CLS} type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="john@example.com" />
        </div>
        <div>
          <label className={LABEL_CLS}>Phone</label>
          <input className={INPUT_CLS} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
        </div>
        <div>
          <label className={LABEL_CLS}>Password <span className="text-red-400">*</span></label>
          <input className={INPUT_CLS} type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="At least 8 characters" />
        </div>
        <div>
          <label className={LABEL_CLS}>Role</label>
          <select className={INPUT_CLS} value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={() => navigate('/users')} className="px-4 py-2.5 text-sm bg-admin-elevated border border-admin-border rounded-md text-admin-text-1 hover:bg-admin-hover transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-admin-accent hover:bg-admin-accent-dim text-white rounded-md px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
