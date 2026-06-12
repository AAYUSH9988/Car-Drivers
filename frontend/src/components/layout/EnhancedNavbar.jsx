import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const EnhancedNavbar = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenu] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    if (!isHome) {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  useEffect(() => {
    setMobileMenu(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const navBg = isHome && !isScrolled
    ? 'bg-background border-b border-outline-variant'
    : 'bg-background/95 border-b border-outline-variant backdrop-blur-sm';

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-[1440px] mx-auto px-gutter md:px-margin-edge">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Brand Logo */}
          <Link
            to="/"
            className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tighter"
          >
            GOPILOT
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center">
            <NavLink to="/" active={isActive('/')}>Home</NavLink>
            <NavLink to="/pilots" active={isActive('/pilots')}>Fleet</NavLink>
            <NavLink to="/services" active={isActive('/services')}>Services</NavLink>
            <NavLink to="/about" active={isActive('/about')}>About</NavLink>
            <NavLink to="/contact" active={isActive('/contact')}>Contact</NavLink>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'driver' && (
                  <Link
                    to="/driver-dashboard"
                    className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                  >
                    Earnings
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                >
                  {user.name}
                </Link>
                <button
                  onClick={logout}
                  className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant hover:text-tertiary-container transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-on-primary font-ui-button text-ui-button uppercase px-6 py-3 hover:bg-on-surface transition-colors duration-300"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenu(!isMobileMenuOpen)}
            className="md:hidden p-2 text-primary"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface border-t border-outline-variant">
          <div className="px-gutter py-6 space-y-4">
            <MobileNavLink to="/" active={isActive('/')}>Home</MobileNavLink>
            <MobileNavLink to="/pilots" active={isActive('/pilots')}>Fleet</MobileNavLink>
            <MobileNavLink to="/services" active={isActive('/services')}>Services</MobileNavLink>
            <MobileNavLink to="/about" active={isActive('/about')}>About</MobileNavLink>
            <MobileNavLink to="/contact" active={isActive('/contact')}>Contact</MobileNavLink>

            <div className="pt-4 border-t border-outline-variant space-y-3">
              {user ? (
                <>
                  {user.role === 'driver' && (
                    <Link to="/driver-dashboard" className="block font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
                      Earnings
                    </Link>
                  )}
                  <Link to="/dashboard" className="block font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
                    {user.name}
                  </Link>
                  <button onClick={logout} className="block font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-block bg-primary text-on-primary font-ui-button text-ui-button uppercase px-6 py-3 hover:bg-on-surface transition-colors"
                  >
                    Book Now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`font-ui-label text-ui-label uppercase tracking-widest transition-colors duration-300 ${
      active
        ? 'text-primary'
        : 'text-on-surface-variant hover:text-primary'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`block font-ui-label text-ui-label uppercase tracking-widest ${
      active ? 'text-primary' : 'text-on-surface-variant'
    }`}
  >
    {children}
  </Link>
);

export default EnhancedNavbar;
