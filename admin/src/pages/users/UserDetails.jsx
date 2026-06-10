import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, IndianRupee, CheckCircle, XCircle } from 'lucide-react';
import { userAPI } from '../../services/api';
import { toast } from 'sonner';
import Breadcrumb from '../../components/layout/Breadcrumb';

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-admin-border last:border-0">
    <span className="text-sm text-admin-text-3">{label}</span>
    <span className="text-sm text-admin-text-1 font-medium text-right ml-4">{value || '—'}</span>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-admin-elevated border border-admin-border rounded-md p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={14} className={color} />
      <span className="text-2xs text-admin-text-3 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-2xl font-semibold font-mono text-admin-text-1">{value}</div>
  </div>
);

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          userAPI.getById(id),
          userAPI.getStats(id),
        ]);
        if (mounted) {
          setUser(userRes.data.data);
          setStats(statsRes.data.data?.stats);
          setRecentBookings(statsRes.data.data?.recentBookings || []);
        }
      } catch {
        toast.error('Failed to load user');
        navigate('/users');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-admin-elevated rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-admin-surface border border-admin-border rounded-md h-64" />
          <div className="lg:col-span-2 bg-admin-surface border border-admin-border rounded-md h-64" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/users')} className="p-2 text-admin-text-3 hover:text-admin-text-1 hover:bg-admin-elevated rounded-md transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-admin-text-1">{user.name}</h1>
          <p className="text-sm text-admin-text-3 mt-0.5">{user.email}</p>
        </div>
        <span className={`ml-auto inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-violet-400/10 text-violet-400' : 'bg-blue-400/10 text-blue-400'}`}>
          {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
        </span>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Calendar}     label="Total Bookings" value={stats.totalBookings ?? 0}                         color="text-blue-400"    />
          <StatCard icon={CheckCircle}  label="Completed"      value={stats.completedBookings ?? 0}                     color="text-emerald-400" />
          <StatCard icon={XCircle}      label="Cancelled"      value={stats.cancelledBookings ?? 0}                     color="text-red-400"     />
          <StatCard icon={IndianRupee}   label="Total Spent"    value={`₹${(stats.totalSpent || 0).toFixed(2)}`}         color="text-amber-400"   />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-admin-surface border border-admin-border rounded-md p-6">
          <h2 className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest mb-4">Account Info</h2>
          <InfoRow label="Full Name"      value={user.name} />
          <InfoRow label="Email"          value={user.email} />
          <InfoRow label="Phone"          value={user.phone} />
          <InfoRow label="Role"           value={user.role} />
          <InfoRow label="Joined"         value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null} />
          <InfoRow label="Email Verified" value={user.isEmailVerified ? 'Yes' : 'No'} />
        </div>

        <div className="lg:col-span-2 bg-admin-surface border border-admin-border rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-admin-border">
            <span className="text-sm font-medium text-admin-text-1">Recent Bookings</span>
            <button
              onClick={() => navigate(`/bookings?userId=${id}`)}
              className="text-xs text-admin-accent hover:text-admin-accent-dim transition-colors"
            >
              View all →
            </button>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-admin-text-3 text-center py-10">No bookings yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-admin-elevated border-b border-admin-border">
                  {['Reference', 'Date', 'Amount', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-2xs font-medium text-admin-text-2 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr
                    key={b._id}
                    onClick={() => navigate(`/bookings/${b._id}`)}
                    className="border-b border-admin-border hover:bg-admin-hover transition-colors cursor-pointer last:border-0"
                  >
                    <td className="px-4 py-3 text-sm font-mono text-admin-text-2">{b.bookingReference || b._id?.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-sm text-admin-text-3">{b.startTime ? new Date(b.startTime).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-admin-text-1">₹{b.totalAmount?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-3 text-sm text-admin-text-2 capitalize">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
