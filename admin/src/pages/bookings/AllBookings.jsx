import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { toast } from 'sonner';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

const AllBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const load = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await bookingAPI.getAll({
        page,
        limit: 20,
        status: activeTab === 'all' ? undefined : activeTab,
      });
      setBookings(res.data.data || []);
      setPagination(res.data.pagination || { page, limit: 20, total: 0, pages: 1 });
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(1); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-admin-text-1">Bookings</h1>
        <p className="text-sm text-admin-text-3 mt-0.5">{pagination.total} total bookings</p>
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-admin-border">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors capitalize relative ${
              activeTab === tab
                ? 'text-admin-accent'
                : 'text-admin-text-3 hover:text-admin-text-2'
            }`}
          >
            {tab === 'all' ? 'All' : tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-admin-accent" />
            )}
          </button>
        ))}
      </div>

      <div className="bg-admin-surface border border-admin-border rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-admin-elevated border-b border-admin-border">
              {['Reference', 'Customer', 'Driver', 'Date', 'Amount', 'Payment', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-2xs font-medium text-admin-text-2 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={8} cols={7} />
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16">
                  <EmptyState
                    title="No bookings found"
                    description={`No ${activeTab === 'all' ? '' : activeTab} bookings match your filters.`}
                    action={{ label: 'Refresh', onClick: () => load(1) }}
                  />
                </td>
              </tr>
            ) : (
              bookings.map(b => (
                <tr
                  key={b._id}
                  onClick={() => navigate(`/bookings/${b._id}`)}
                  className="border-b border-admin-border hover:bg-admin-hover transition-colors cursor-pointer last:border-0"
                >
                  <td className="px-4 py-3.5 text-sm font-mono text-admin-text-2">
                    {b.bookingReference || b._id?.slice(0, 10).toUpperCase()}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-admin-text-1">{b.user?.name || '—'}</td>
                  <td className="px-4 py-3.5 text-sm text-admin-text-2">{b.driver?.user?.name || '—'}</td>
                  <td className="px-4 py-3.5 text-sm text-admin-text-3">
                    {b.startTime ? new Date(b.startTime).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-mono text-admin-text-1">
                    ₹{(b.totalAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium ${b.paymentStatus === 'completed' ? 'text-emerald-400' : b.paymentStatus === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
                      {b.paymentStatus?.charAt(0).toUpperCase() + b.paymentStatus?.slice(1) || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={b.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-admin-border">
            <span className="text-xs text-admin-text-3">{pagination.total} bookings</span>
            <Pagination
              page={pagination.page}
              totalPages={pagination.pages}
              onChange={load}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBookings;
