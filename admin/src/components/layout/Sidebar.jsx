import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Users, CalendarCheck, BarChart2, Settings, LogOut } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { SidebarContext } from './Layout';
import Avatar from '../common/Avatar';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Management',
    items: [
      { label: 'Drivers', path: '/drivers', icon: Car },
      { label: 'Users', path: '/users', icon: Users },
      { label: 'Bookings', path: '/bookings', icon: CalendarCheck },
    ]
  },
  {
    label: 'System',
    items: [
      { label: 'Reports', path: '/reports', icon: BarChart2 },
      { label: 'Settings', path: '/settings', icon: Settings },
    ]
  },
];

const NavItem = ({ item, active }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-0.5 ${
        active
          ? 'bg-admin-accent/10 text-admin-accent border-l-2 border-admin-accent pl-[10px]'
          : 'text-admin-text-2 hover:bg-admin-hover hover:text-admin-text-1'
      }`}
    >
      <Icon size={16} strokeWidth={1.75} />
      <span className="flex-1">{item.label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`bg-admin-sidebar border-r border-admin-border w-64 min-h-screen fixed left-0 top-0 z-50 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center gap-3 px-5 border-b border-admin-border shrink-0">
          <div className="w-6 h-6 bg-admin-accent rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">G</span>
          </div>
          <span className="text-sm font-semibold text-admin-text-1">GoPilot</span>
          <span className="ml-auto text-2xs text-admin-text-3 bg-admin-elevated px-1.5 py-0.5 rounded uppercase tracking-widest">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="mb-5">
              <p className="text-2xs uppercase tracking-widest text-admin-text-3 px-3 mb-1.5 font-medium">
                {section.label}
              </p>
              {section.items.map(item => (
                <NavItem key={item.path} item={item} active={isActive(item.path)} />
              ))}
            </div>
          ))}
        </nav>

        {/* Admin info */}
        <div className="p-3 border-t border-admin-border">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-admin-hover transition-colors group"
          >
            <Avatar name={user?.name} size={28} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-admin-text-1 truncate">{user?.name || 'Admin'}</p>
              <p className="text-2xs text-admin-text-3 truncate">{user?.email || ''}</p>
            </div>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-sm text-admin-text-3 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
