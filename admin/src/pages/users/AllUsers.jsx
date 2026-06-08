import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import { userAPI } from '../../services/api';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';

const AllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await userAPI.getAll({ page, limit: 20, search: search || undefined });
      setUsers(res.data.data || []);
      setPagination(res.data.pagination || { page, limit: 20, total: 0, pages: 1 });
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(1); }, [load]);

  const handleDelete = async (id, name) => {
    try {
      await userAPI.delete(id);
      toast.success(`${name} deleted`);
      load(pagination.page);
    } catch {
      toast.error('Delete failed');
    }
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-admin-text-1">Users</h1>
          <p className="text-sm text-admin-text-3 mt-0.5">{pagination.total} registered users</p>
        </div>
        <button
          onClick={() => navigate('/users/add')}
          className="flex items-center gap-2 bg-admin-accent hover:bg-admin-accent-dim text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add User
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
              placeholder="Search by name, email, phone…"
              className="w-full bg-admin-elevated border border-admin-border rounded-md pl-9 pr-3 py-1.5 text-sm text-admin-text-1 placeholder-admin-text-3 outline-none focus:border-admin-border-alt"
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-admin-elevated border-b border-admin-border">
              {['Name', 'Email', 'Phone', 'Role', 'Joined', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-2xs font-medium text-admin-text-2 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={8} cols={6} />
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16">
                  <EmptyState
                    title="No users found"
                    description={search ? 'Try a different search.' : 'Get started by adding your first user.'}
                    action={{ label: 'Add User', onClick: () => navigate('/users/add') }}
                  />
                </td>
              </tr>
            ) : (
              users.map(u => (
                  <tr
                    key={u._id}
                    onClick={() => navigate(`/users/${u._id}`)}
                    className="border-b border-admin-border hover:bg-admin-hover transition-colors cursor-pointer last:border-0"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-admin-elevated border border-admin-border flex items-center justify-center text-xs font-semibold text-admin-text-2 shrink-0">
                          {u.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium text-admin-text-1">{u.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-admin-text-2">{u.email}</td>
                    <td className="px-4 py-3.5 text-sm text-admin-text-3 font-mono">{u.phone || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-violet-400/10 text-violet-400' : 'bg-blue-400/10 text-blue-400'}`}>
                        {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-admin-text-3">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setConfirm({ id: u._id, name: u.name })}
                        className="p-1.5 text-admin-text-3 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-admin-border">
            <span className="text-xs text-admin-text-3">{pagination.total} users</span>
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
        title="Delete User"
        description={`Permanently delete ${confirm?.name}? This cannot be undone.`}
        danger
        onConfirm={() => handleDelete(confirm?.id, confirm?.name)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default AllUsers;
