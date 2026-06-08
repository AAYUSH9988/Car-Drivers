import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Star, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { driverAPI } from '../../services/api';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';


const AllDrivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMenu, setActionMenu] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await driverAPI.getAll({ page, limit: 20, search, status: statusFilter || undefined });
      setDrivers(res.data.data || []);
      setPagination(res.data.pagination || { page, limit: 20, total: 0, pages: 1 });
    } catch {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const handleApprove = async (id, name) => {
    try {
      await driverAPI.approve(id);
      toast.success(`${name} approved`);
      load(pagination.page);
    } catch {
      toast.error('Approval failed');
    }
  };

  const handleSuspend = async (id, name) => {
    try {
      await driverAPI.suspend(id);
      toast.success(`${name} suspended`);
      load(pagination.page);
    } catch {
      toast.error('Suspension failed');
    }
    setConfirm(null);
  };

  const TableRow = ({ driver }) => {
    const user = driver.user || {};
    const name = user.name || '—';
    return (
      <tr
        onClick={() => navigate(`/drivers/${driver._id}`)}
        className="border-b border-admin-border hover:bg-admin-hover transition-colors cursor-pointer"
      >
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-admin-accent/20 flex items-center justify-center text-xs font-semibold text-admin-accent shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-admin-text-1">{name}</p>
              <p className="text-xs text-admin-text-3">{user.email || '—'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5 text-sm text-admin-text-2 font-mono">{driver.licenseNumber || '—'}</td>
        <td className="px-4 py-3.5 text-sm text-admin-text-2">{driver.experience || 0} yrs</td>
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-1 text-sm text-admin-text-1">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            {driver.rating?.toFixed(1) || '0.0'}
          </div>
        </td>
        <td className="px-4 py-3.5 text-sm font-mono text-admin-text-1">${driver.hourlyRate || 0}/hr</td>
        <td className="px-4 py-3.5"><StatusBadge status={driver.status} /></td>
        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
          <div className="relative">
            <button
              onClick={() => setActionMenu(actionMenu === driver._id ? null : driver._id)}
              className="p-1.5 text-admin-text-3 hover:text-admin-text-1 hover:bg-admin-elevated rounded-md transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
            {actionMenu === driver._id && (
              <div className="absolute right-0 top-8 w-40 bg-admin-elevated border border-admin-border rounded-md shadow-xl z-20 animate-fade-in">
                <button
                  onClick={() => { navigate(`/drivers/${driver._id}`); setActionMenu(null); }}
                  className="w-full text-left px-3 py-2 text-sm text-admin-text-1 hover:bg-admin-hover transition-colors"
                >
                  View Details
                </button>
                {driver.status !== 'active' && (
                  <button
                    onClick={() => { handleApprove(driver._id, name); setActionMenu(null); }}
                    className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-admin-hover transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                )}
                {driver.status !== 'suspended' && (
                  <button
                    onClick={() => { setConfirm({ id: driver._id, name }); setActionMenu(null); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-admin-hover transition-colors flex items-center gap-2"
                  >
                    <XCircle size={14} /> Suspend
                  </button>
                )}
                <button
                  onClick={() => { navigate(`/drivers/verify/${driver._id}`); setActionMenu(null); }}
                  className="w-full text-left px-3 py-2 text-sm text-admin-text-2 hover:bg-admin-hover transition-colors border-t border-admin-border"
                >
                  Verify Docs
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-admin-text-1">Drivers</h1>
          <p className="text-sm text-admin-text-3 mt-0.5">{pagination.total} total drivers</p>
        </div>
        <button
          onClick={() => navigate('/drivers/add')}
          className="flex items-center gap-2 bg-admin-accent hover:bg-admin-accent-dim text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Driver
        </button>
      </div>

      <div className="bg-admin-surface border border-admin-border rounded-md overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-admin-border">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-3" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search drivers…"
              className="w-full bg-admin-elevated border border-admin-border rounded-md pl-9 pr-3 py-1.5 text-sm text-admin-text-1 placeholder-admin-text-3 outline-none focus:border-admin-border-alt"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-admin-elevated border border-admin-border rounded-md px-3 py-1.5 text-sm text-admin-text-1 outline-none focus:border-admin-border-alt cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-admin-elevated border-b border-admin-border">
              {['Driver', 'License', 'Experience', 'Rating', 'Rate', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-2xs font-medium text-admin-text-2 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={8} cols={7} />
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16">
                  <EmptyState
                    title="No drivers found"
                    description={search || statusFilter ? 'Try clearing your filters.' : 'Get started by adding your first driver.'}
                    action={{ label: 'Add Driver', onClick: () => navigate('/drivers/add') }}
                  />
                </td>
              </tr>
            ) : (
              drivers.map(d => <TableRow key={d._id} driver={d} />)
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-admin-border">
            <span className="text-xs text-admin-text-3">{pagination.total} drivers</span>
            <Pagination
              page={pagination.page}
              totalPages={pagination.pages}
              onChange={load}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="Suspend Driver"
        description={`Are you sure you want to suspend ${confirm?.name}? They will not be able to accept bookings.`}
        danger
        onConfirm={() => handleSuspend(confirm?.id, confirm?.name)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default AllDrivers;
