import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronRight, Menu } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { SidebarContext } from './Layout';
import Avatar from '../common/Avatar';

const LABELS = {
  '/': 'Dashboard',
  '/drivers': 'Drivers',
  '/drivers/add': 'Add Driver',
  '/users': 'Users',
  '/users/add': 'Add User',
  '/bookings': 'Bookings',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/profile': 'Profile',
};

const Header = () => {
  const { user } = useContext(AuthContext);
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useData();
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const location = useLocation();

  const unread = notifications.filter(n => !n.read).length;

  // Build breadcrumb segments
  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = LABELS[path] || seg.charAt(0).toUpperCase() + seg.slice(1);
    return { path, label };
  });

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-14 bg-admin-bg border-b border-admin-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 text-admin-text-3 hover:text-admin-text-1 hover:bg-admin-elevated rounded-md transition-colors -ml-2"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <nav className="flex items-center gap-1.5 text-sm">
          <Link to="/" className="text-admin-text-3 hover:text-admin-text-1 transition-colors">Dashboard</Link>
          {crumbs.map((c, i) => (
            <React.Fragment key={c.path}>
              <ChevronRight size={14} className="text-admin-text-3" />
              <span className={i === crumbs.length - 1 ? 'text-admin-text-1 font-medium' : 'text-admin-text-3 hover:text-admin-text-1 transition-colors'}>
                {c.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(s => !s)}
            className="relative p-2 text-admin-text-3 hover:text-admin-text-1 hover:bg-admin-elevated rounded-md transition-colors"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-admin-accent rounded-full" />
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-1 w-80 bg-admin-elevated border border-admin-border rounded-md shadow-xl z-50 animate-slide-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
                <span className="text-sm font-medium text-admin-text-1">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllNotificationsAsRead} className="text-2xs text-admin-accent hover:text-admin-accent-dim transition-colors uppercase tracking-wide">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-admin-text-3 text-center py-8">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`px-4 py-3 border-b border-admin-border last:border-0 cursor-pointer hover:bg-admin-hover transition-colors ${!n.read ? 'bg-admin-accent/5' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-admin-accent mt-1.5 shrink-0" />}
                        <div className={!n.read ? '' : 'ml-3.5'}>
                          <p className="text-sm font-medium text-admin-text-1">{n.title}</p>
                          <p className="text-xs text-admin-text-3 mt-0.5">{n.message}</p>
                          <p className="text-2xs text-admin-text-3 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-admin-border" />

        {/* Avatar */}
        <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar name={user?.name} size={32} />
          <span className="text-sm font-medium text-admin-text-2 hidden md:block">{user?.name || 'Admin'}</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
