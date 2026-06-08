import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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

const Breadcrumb = ({ className = '' }) => {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (pathname === '/') return null;

  return (
    <nav className={`flex items-center gap-1.5 text-sm ${className}`} aria-label="Breadcrumb">
      <Link to="/" className="text-admin-text-3 hover:text-admin-text-1 transition-colors">
        Dashboard
      </Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const label = LABELS[path] || seg.charAt(0).toUpperCase() + seg.slice(1);
        const isLast = i === segments.length - 1;

        return (
          <React.Fragment key={path}>
            <ChevronRight size={14} className="text-admin-text-3" />
            {isLast ? (
              <span className="text-admin-text-1 font-medium">{label}</span>
            ) : (
              <Link to={path} className="text-admin-text-3 hover:text-admin-text-1 transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
