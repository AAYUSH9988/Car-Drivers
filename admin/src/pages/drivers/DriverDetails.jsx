import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Car, Clock, DollarSign, FileText, CheckCircle, XCircle } from 'lucide-react';
import { driverAPI } from '../../services/api';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Breadcrumb from '../../components/layout/Breadcrumb';

const STATUS_MAP = {
  active:    { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  pending:   { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10'   },
  suspended: { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-400/10'     },
  inactive:  { dot: 'bg-slate-400',   text: 'text-slate-400',   bg: 'bg-slate-400/10'   },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between py-3 border-b border-admin-border last:border-0">
    <span className="text-sm text-admin-text-3">{label}</span>
    <span className="text-sm text-admin-text-1 font-medium text-right ml-4">{value || '—'}</span>
  </div>
);

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [driverRes, statsRes] = await Promise.all([
          driverAPI.getById(id),
          driverAPI.getStats(id),
        ]);
        if (mounted) {
          setDriver(driverRes.data.data);
          setStats(statsRes.data.data?.stats);
        }
      } catch {
        toast.error('Failed to load driver details');
        navigate('/drivers');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  const handleApprove = async () => {
    setActioning(true);
    try {
      await driverAPI.approve(id);
      toast.success('Driver approved');
      setDriver(d => ({ ...d, status: 'active' }));
    } catch {
      toast.error('Approval failed');
    } finally {
      setActioning(false);
    }
  };

  const handleSuspend = async () => {
    setActioning(true);
    try {
      await driverAPI.suspend(id);
      toast.success('Driver suspended');
      setDriver(d => ({ ...d, status: 'suspended' }));
    } catch {
      toast.error('Suspension failed');
    } finally {
      setActioning(false);
      setConfirmSuspend(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-admin-elevated rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-admin-surface border border-admin-border rounded-md h-64" />
          <div className="bg-admin-surface border border-admin-border rounded-md h-64" />
        </div>
      </div>
    );
  }

  if (!driver) return null;
  const user = driver.user || {};
  const docs = driver.documents || {};

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/drivers')} className="p-2 text-admin-text-3 hover:text-admin-text-1 hover:bg-admin-elevated rounded-md transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-admin-text-1">{user.name || 'Driver'}</h1>
            <StatusBadge status={driver.status} />
          </div>
          <p className="text-sm text-admin-text-3 mt-0.5">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {driver.status !== 'active' && (
            <button
              disabled={actioning}
              onClick={handleApprove}
              className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <CheckCircle size={16} /> Approve
            </button>
          )}
          {driver.status !== 'suspended' && (
            <button
              disabled={actioning}
              onClick={() => setConfirmSuspend(true)}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <XCircle size={16} /> Suspend
            </button>
          )}
          <button
            onClick={() => navigate(`/drivers/verify/${id}`)}
            className="flex items-center gap-2 bg-admin-surface border border-admin-border text-admin-text-1 hover:bg-admin-elevated rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            <FileText size={16} /> Verify Docs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-admin-surface border border-admin-border rounded-md p-6">
            <h2 className="text-sm font-semibold text-admin-text-1 mb-4 uppercase tracking-widest text-2xs text-admin-text-2">Driver Info</h2>
            <InfoRow label="Full Name" value={user.name} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="License Number" value={driver.licenseNumber} />
            <InfoRow label="Experience" value={driver.experience ? `${driver.experience} years` : null} />
            <InfoRow label="Hourly Rate" value={driver.hourlyRate ? `$${driver.hourlyRate}/hr` : null} />
            <InfoRow label="Vehicle Types" value={driver.vehicleTypes?.join(', ')} />
            <InfoRow label="Languages" value={driver.languages?.join(', ') || 'Not specified'} />
            <InfoRow label="Working Hours" value={driver.workingHours ? `${driver.workingHours.start} – ${driver.workingHours.end}` : null} />
            <InfoRow label="Availability" value={driver.isAvailable ? 'Available' : 'Unavailable'} />
          </div>

          {/* Documents */}
          <div className="bg-admin-surface border border-admin-border rounded-md p-6">
            <h2 className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest mb-4">Documents</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {docs.license && (
                <DocCard label="Driver License" url={docs.license} />
              )}
              {docs.insurance && (
                <DocCard label="Insurance" url={docs.insurance} />
              )}
              {docs.vehiclePhoto && (
                <DocCard label="Vehicle Photo" url={docs.vehiclePhoto} />
              )}
              {docs.profilePhoto && (
                <DocCard label="Profile Photo" url={docs.profilePhoto} />
              )}
              {!docs.license && !docs.insurance && (
                <p className="text-sm text-admin-text-3 col-span-3">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-admin-surface border border-admin-border rounded-md p-6">
            <div className="flex items-center gap-2 mb-6">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-2xl font-semibold font-mono text-admin-text-1">{driver.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-sm text-admin-text-3">/ 5.0</span>
            </div>
            <div className="space-y-4">
              <StatItem icon={Car} label="Total Trips" value={driver.totalTrips || stats?.totalBookings || 0} />
              <StatItem icon={DollarSign} label="Total Earnings" value={`$${(stats?.totalEarnings || 0).toLocaleString()}`} />
              <StatItem icon={CheckCircle} label="Completed" value={stats?.completedBookings || 0} />
              <StatItem icon={XCircle} label="Cancelled" value={stats?.cancelledBookings || 0} />
            </div>
          </div>

          {driver.preferredLocations?.length > 0 && (
            <div className="bg-admin-surface border border-admin-border rounded-md p-6">
              <h3 className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest mb-3">Preferred Locations</h3>
              <div className="space-y-2">
                {driver.preferredLocations.map((loc, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-admin-text-2">
                    <MapPin size={12} className="text-admin-text-3 shrink-0" />
                    {loc}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmSuspend}
        title="Suspend Driver"
        description={`Suspend ${user.name}? They will no longer be able to accept bookings until reinstated.`}
        danger
        confirmLabel="Suspend"
        onConfirm={handleSuspend}
        onCancel={() => setConfirmSuspend(false)}
      />
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-sm text-admin-text-3">
      <Icon size={14} />
      {label}
    </div>
    <span className="text-sm font-semibold font-mono text-admin-text-1">{value}</span>
  </div>
);

const DocCard = ({ label, url }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="block border border-admin-border rounded-md overflow-hidden hover:border-admin-border-alt transition-colors group"
    onClick={e => e.stopPropagation()}
  >
    <div className="h-24 bg-admin-elevated overflow-hidden">
      <img src={url} alt={label} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" onError={e => { e.target.style.display = 'none'; }} />
    </div>
    <div className="px-2 py-1.5">
      <p className="text-2xs text-admin-text-3 truncate">{label}</p>
    </div>
  </a>
);

export default DriverDetails;
