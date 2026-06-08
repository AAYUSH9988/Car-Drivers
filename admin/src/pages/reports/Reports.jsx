import React, { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { reportAPI, dashboardAPI } from '../../services/api';
import { toast } from 'sonner';
import BookingChart from '../../components/dashboard/BookingChart';

const REPORT_TYPES = ['revenue', 'bookings', 'users', 'drivers'];
const PERIODS = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 90 days', value: '90' },
];

const Reports = () => {
  const [reportType, setReportType] = useState('revenue');
  const [period, setPeriod] = useState('30');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getAnalytics(reportType, period);
      setAnalytics(res.data.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [reportType, period]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await reportAPI.export(reportType);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  // Map analytics data to chart format
  const getChartData = () => {
    if (!analytics) return null;
    if (reportType === 'revenue' && analytics.dailyRevenue) {
      return {
        labels: analytics.dailyRevenue.map(d => `${d._id.day}/${d._id.month}`),
        values: analytics.dailyRevenue.map(d => d.revenue),
      };
    }
    if (reportType === 'users' && analytics.userGrowth) {
      return {
        labels: analytics.userGrowth.map(d => `${d._id.day}/${d._id.month}`),
        values: analytics.userGrowth.map(d => d.newUsers),
      };
    }
    return null;
  };

  const chartData = getChartData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-admin-text-1">Reports</h1>
          <p className="text-sm text-admin-text-3 mt-0.5">Analytics and data exports</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 text-admin-text-3 hover:text-admin-text-1 hover:bg-admin-elevated rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-admin-surface border border-admin-border text-admin-text-1 hover:bg-admin-elevated rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? 'Exporting…' : 'Export JSON'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex bg-admin-surface border border-admin-border rounded-md overflow-hidden">
          {REPORT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
                reportType === type
                  ? 'bg-admin-accent text-white'
                  : 'text-admin-text-2 hover:text-admin-text-1 hover:bg-admin-elevated'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="bg-admin-surface border border-admin-border rounded-md px-3 py-2 text-sm text-admin-text-1 outline-none focus:border-admin-border-alt cursor-pointer"
        >
          {PERIODS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Chart */}
      {chartData && (
        <div className="bg-admin-surface border border-admin-border rounded-md p-6">
          <span className="text-sm font-medium text-admin-text-1 block mb-6 capitalize">
            {reportType} — Last {period} days
          </span>
          {loading
            ? <div className="h-48 bg-admin-elevated rounded animate-pulse" />
            : <BookingChart data={chartData} />
          }
        </div>
      )}

      {/* Top data tables */}
      {!loading && analytics && (
        <>
          {reportType === 'revenue' && analytics.topDriversByRevenue?.length > 0 && (
            <div className="bg-admin-surface border border-admin-border rounded-md overflow-hidden">
              <div className="px-5 py-4 border-b border-admin-border">
                <span className="text-sm font-medium text-admin-text-1">Top Drivers by Revenue</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-admin-elevated border-b border-admin-border">
                    {['Driver', 'Revenue', 'Trips'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-2xs font-medium text-admin-text-2 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analytics.topDriversByRevenue.map((d, i) => (
                    <tr key={i} className="border-b border-admin-border last:border-0">
                      <td className="px-4 py-3 text-sm text-admin-text-1">{d.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm font-mono text-admin-text-1">${d.revenue?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3 text-sm text-admin-text-2">{d.trips || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'users' && analytics.activeUsers?.length > 0 && (
            <div className="bg-admin-surface border border-admin-border rounded-md overflow-hidden">
              <div className="px-5 py-4 border-b border-admin-border">
                <span className="text-sm font-medium text-admin-text-1">Most Active Users</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-admin-elevated border-b border-admin-border">
                    {['User', 'Email', 'Bookings', 'Spent'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-2xs font-medium text-admin-text-2 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analytics.activeUsers.map((u, i) => (
                    <tr key={i} className="border-b border-admin-border last:border-0">
                      <td className="px-4 py-3 text-sm text-admin-text-1">{u.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-admin-text-2">{u.email || '—'}</td>
                      <td className="px-4 py-3 text-sm font-mono text-admin-text-1">{u.bookings || 0}</td>
                      <td className="px-4 py-3 text-sm font-mono text-admin-text-1">${u.totalSpent?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!chartData && (
            <div className="bg-admin-surface border border-admin-border rounded-md px-5 py-10 text-center">
              <p className="text-sm text-admin-text-3">No chart data available for this report type yet.</p>
              <p className="text-xs text-admin-text-3 mt-1">Data will appear as bookings and activity accumulate.</p>
            </div>
          )}
        </>
      )}

      {loading && !chartData && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-admin-surface border border-admin-border rounded-md h-16 animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
