import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Car, FileText, Shield } from 'lucide-react';
import { driverAPI } from '../../services/api';
import { toast } from 'sonner';

const INPUT_CLS = 'w-full bg-admin-elevated border border-admin-border rounded-md px-3 py-2.5 text-sm text-admin-text-1 placeholder-admin-text-3 outline-none focus:border-admin-border-alt transition-colors';
const LABEL_CLS = 'block text-sm text-admin-text-2 mb-1.5';

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-admin-surface border border-admin-border rounded-md p-6 space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={15} className="text-admin-text-3" />
      <h2 className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const Field = ({ label, required, span, children }) => (
  <div className={span === 2 ? 'md:col-span-2' : ''}>
    <label className={LABEL_CLS}>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
    {children}
  </div>
);

const AddDriver = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    dateOfBirth: '', gender: 'male', address: '', city: '', state: '', zipCode: '',
    experience: '', hourlyRate: '',
    vehicleType: 'sedan', vehicleMake: '', vehicleModel: '', vehicleYear: '', vehicleColor: '', licensePlate: '',
    licenseNumber: '', licenseExpiry: '', insuranceProvider: '', insurancePolicyNumber: '', insuranceExpiry: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const field = (k, type = 'text', placeholder = '') => (
    <input
      className={INPUT_CLS}
      type={type}
      value={form[k]}
      onChange={e => set(k, e.target.value)}
      placeholder={placeholder}
    />
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error('First name, last name, email and password are required');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        password: form.password,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender,
        address: form.address ? { street: form.address, city: form.city, state: form.state, zipCode: form.zipCode } : undefined,
        experience: form.experience ? Number(form.experience) : 0,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : 0,
        vehicleType: form.vehicleType,
        licenseNumber: form.licenseNumber || undefined,
      };
      await driverAPI.create(payload);
      toast.success('Driver created successfully');
      navigate('/drivers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create driver');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/drivers')}
          className="p-2 text-admin-text-3 hover:text-admin-text-1 hover:bg-admin-elevated rounded-md transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-admin-text-1">Add Driver</h1>
          <p className="text-sm text-admin-text-3 mt-0.5">Register a new driver in the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section icon={User} title="Personal Information">
          <Field label="First Name" required><input className={INPUT_CLS} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="John" required /></Field>
          <Field label="Last Name" required><input className={INPUT_CLS} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Doe" required /></Field>
          <Field label="Email Address" required><input className={INPUT_CLS} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" required /></Field>
          <Field label="Phone"><input className={INPUT_CLS} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" /></Field>
          <Field label="Password" required><input className={INPUT_CLS} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="At least 8 characters" required /></Field>
          <Field label="Date of Birth"><input className={INPUT_CLS} type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} /></Field>
          <Field label="Gender">
            <select className={INPUT_CLS} value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Address" span={2}><input className={INPUT_CLS} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" /></Field>
          <Field label="City"><input className={INPUT_CLS} value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" /></Field>
          <Field label="State"><input className={INPUT_CLS} value={form.state} onChange={e => set('state', e.target.value)} placeholder="State" /></Field>
          <Field label="ZIP Code"><input className={INPUT_CLS} value={form.zipCode} onChange={e => set('zipCode', e.target.value)} placeholder="ZIP" /></Field>
        </Section>

        <Section icon={Shield} title="Driver Details">
          <Field label="Experience (years)"><input className={INPUT_CLS} type="number" min="0" value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="0" /></Field>
          <Field label="Hourly Rate ($)"><input className={INPUT_CLS} type="number" min="0" step="0.01" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} placeholder="25.00" /></Field>
        </Section>

        <Section icon={Car} title="Vehicle Information">
          <Field label="Vehicle Type">
            <select className={INPUT_CLS} value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)}>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="luxury">Luxury</option>
              <option value="premium">Premium</option>
              <option value="van">Van</option>
            </select>
          </Field>
          <Field label="Make"><input className={INPUT_CLS} value={form.vehicleMake} onChange={e => set('vehicleMake', e.target.value)} placeholder="Toyota" /></Field>
          <Field label="Model"><input className={INPUT_CLS} value={form.vehicleModel} onChange={e => set('vehicleModel', e.target.value)} placeholder="Camry" /></Field>
          <Field label="Year"><input className={INPUT_CLS} type="number" min="2000" max={new Date().getFullYear()} value={form.vehicleYear} onChange={e => set('vehicleYear', e.target.value)} placeholder="2022" /></Field>
          <Field label="Color"><input className={INPUT_CLS} value={form.vehicleColor} onChange={e => set('vehicleColor', e.target.value)} placeholder="White" /></Field>
          <Field label="License Plate"><input className={INPUT_CLS} value={form.licensePlate} onChange={e => set('licensePlate', e.target.value)} placeholder="ABC-1234" /></Field>
        </Section>

        <Section icon={FileText} title="License & Insurance">
          <Field label="License Number"><input className={INPUT_CLS} value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} placeholder="DL123456" /></Field>
          <Field label="License Expiry"><input className={INPUT_CLS} type="date" value={form.licenseExpiry} onChange={e => set('licenseExpiry', e.target.value)} /></Field>
          <Field label="Insurance Provider"><input className={INPUT_CLS} value={form.insuranceProvider} onChange={e => set('insuranceProvider', e.target.value)} placeholder="State Farm" /></Field>
          <Field label="Policy Number"><input className={INPUT_CLS} value={form.insurancePolicyNumber} onChange={e => set('insurancePolicyNumber', e.target.value)} placeholder="POL-001234" /></Field>
          <Field label="Insurance Expiry"><input className={INPUT_CLS} type="date" value={form.insuranceExpiry} onChange={e => set('insuranceExpiry', e.target.value)} /></Field>
        </Section>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate('/drivers')}
            className="px-4 py-2.5 text-sm bg-admin-elevated border border-admin-border rounded-md text-admin-text-1 hover:bg-admin-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-admin-accent hover:bg-admin-accent-dim text-white rounded-md px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Creating…' : 'Create Driver'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDriver;
