import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Car, CalendarCheck, CheckCircle, DollarSign, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { dashboardAPI, bookingAPI } from '../../services/api';
import BookingChart from '../../components/dashboard/BookingChart';
import StatusBadge from '../../components/common/StatusBadge';

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, trend, trendUp }) => (
  <div className="bg-admin-surface border border-admin-border rounded-md p-6">
    <div className="flex items-center justify-between mb-4">
      <span className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest">{label}</span>
      <div className={`p-2 rounded-md ${iconBg}`}>
        <Icon size={16} strokeWidth={1.75} className={iconColor} />
      </div>
    </div>
    <div className="text-3xl font-semibold text-admin-text-1 font-mono">{value}</div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(trend)}% from last month
      </div>
    )}
  </div>
);

const StatSkeleton = () => (
  <div className="bg-admin-surface border border-admin-border rounded-md p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-2.5 w-20 bg-admin-elevated rounded" />
      <div className="w-8 h-8 bg-admin-elevated rounded-md" />
    </div>
    <div className="h-8 w-24 bg-admin-elevated rounded mb-2" />
    <div className="h-2.5 w-16 bg-admin-elevated rounded" />
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryRes, bookingsRes, analyticsRes] = await Promise.allSettled([
        dashboardAPI.getSummary(),
        bookingAPI.getAll({ page: 1, limit: 10 }),
        dashboardAPI.getAnalytics('revenue', period),
      ]);

      if (summaryRes.status === 'fulfilled') {
        setStats(summaryRes.value.data.data);
      }

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.data.success) {
        const b = bookingsRes.value.data.data || [];
        setRecentBookings(b);
      }

      if (analyticsRes.status === 'fulfilled') {
        const monthly = analyticsRes.value.data?.data?.monthly || [];
        // If backend has monthlyRevenue; otherwise fallback to empty
        if (monthly.length > 0) {
          const labels = monthly.map(d => `${d._id.month}/${d._id.day || ''}`);
          const values = monthly.map(d => d.revenue);
          setChartData({ labels, values });
        } else {
          // fallback to mock-like daily if needed
          setChartData({ labels: [], values: [] });
        }
      } else {
        setChartData({ labels: [], values: [] });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const overview = stats?.overview || {};
  const revenue = stats?.revenue || {};

  const cards = [
    { label: 'Total Users',    value: overview.totalUsers    ?? '—', icon: Users,        iconBg: 'bg-blue-500/10',    iconColor: 'text-blue-400'    },
    { label: 'Total Drivers',  value: overview.totalDrivers  ?? '—', icon: Car,          iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
    { label: 'Active Bookings',value: overview.pendingBookings ?? '—', icon: CalendarCheck, iconBg: 'bg-violet-500/10', iconColor: 'text-violet-400'  },
    { label: 'Completed Trips',value: overview.completedBookings ?? '—', icon: CheckCircle, iconBg: 'bg-sky-500/10', iconColor: 'text-sky-400'     },
    { label: 'Total Revenue',  value: revenue.total != null ? `$${Number(revenue.total).toLocaleString()}` : '—', icon: DollarSign, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-admin-text-1">Dashboard</h1>
          <p className="text-sm text-admin-text-3 mt-0.5">Platform overview</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="bg-admin-surface border border-admin-border rounded-md px-3 py-1.5 text-sm text-admin-text-1 outline-none focus:border-admin-border-alt cursor-pointer"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 bg-admin-accent hover:bg-admin-accent-dim text-white rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
          >
            Reports
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
          : cards.map(c => <StatCard key={c.label} {...c} />)
        }
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3 text-sm text-red-400">
          {error} — <button onClick={load} className="underline">Retry</button>
        </div>
      )}

      {/* Chart + Top Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-admin-surface border border-admin-border rounded-md p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-admin-text-1">Revenue</span>
            <span className="text-2xs text-admin-text-3 uppercase tracking-widest">Last {period} days</span>
          </div>
          {loading
            ? <div className="h-48 bg-admin-elevated rounded-md animate-pulse" />
            : <BookingChart data={chartData} />
          }
        </div>

        <div className="bg-admin-surface border border-admin-border rounded-md p-6">
          <span className="text-sm font-medium text-admin-text-1 block mb-4">Top Drivers</span>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-admin-elevated" />
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-admin-elevated rounded mb-1.5" />
                    <div className="h-2.5 w-16 bg-admin-elevated rounded" />
                  </div>
                </div>
              ))
            : (stats?.performance?.topDrivers || []).length === 0
              ? <p className="text-sm text-admin-text-3 py-6 text-center">No driver data yet</p>
              : (stats?.performance?.topDrivers || []).map((d, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-admin-border last:border-0">
                    <div className="w-7 h-7 rounded-full bg-admin-accent/20 flex items-center justify-center text-xs font-semibold text-admin-accent">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-admin-text-1 truncate">{d.name || 'Unknown'}</p>
                      <p className="text-xs text-admin-text-3">{d.totalTrips || 0} trips · {d.rating?.toFixed(1) || '—'}</p>
                    </div>
                  </div>
                ))
          }
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-admin-surface border border-admin-border rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-admin-border">
          <span className="text-sm font-medium text-admin-text-1">Recent Bookings</span>
          <button
            onClick={() => navigate('/bookings')}
            className="text-xs text-admin-accent hover:text-admin-accent-dim flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-admin-border last:border-0">
                <div className="h-3 w-28 bg-admin-elevated rounded" />
                <div className="h-3 flex-1 bg-admin-elevated rounded" />
                <div className="h-3 w-20 bg-admin-elevated rounded" />
                <div className="h-5 w-16 bg-admin-elevated rounded-full" />
              </div>
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <p className="text-sm text-admin-text-3 text-center py-10">No bookings yet</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-admin-elevated border-b border-admin-border">
                {['Reference', 'Customer', 'Driver', 'Amount', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-2xs font-medium text-admin-text-2 uppercase tracking-wider">{h}</th>
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
                  <td className="px-5 py-3.5 text-sm font-mono text-admin-text-2">{b.bookingReference || b._id?.slice(0, 10).toUpperCase()}</td>
                  <td className="px-5 py-3.5 text-sm text-admin-text-1">{b.user?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-admin-text-2">{b.driver?.user?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-admin-text-1">${b.totalAmount?.toFixed(2) || '0.00'}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
