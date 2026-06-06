import { useEffect, useState } from 'react';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/images/logo/GoPilot-logo.png';

const EnhancedNavbar = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled]       = useState(false);
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
    ? 'bg-transparent'
    : 'bg-bg-base/95 backdrop-blur-md border-b border-border shadow-lg';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <img src={logo} alt="GoPilot" className="h-9 w-auto" />
            <span className="font-heading font-bold text-lg text-text-primary">
              Go<span className="text-gold">Pilot</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/"        active={isActive('/')}>Home</NavLink>
            <NavLink to="/pilots"  active={isActive('/pilots')}>Find Pilots</NavLink>
            <NavLink to="/services" active={isActive('/services')}>Services</NavLink>
            <NavLink to="/about"   active={isActive('/about')}>About</NavLink>
            <NavLink to="/contact" active={isActive('/contact')}>Contact</NavLink>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
                >
                  <FaUser className="text-gold text-xs" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-border text-text-secondary hover:border-rose hover:text-rose transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-gold text-bg-base hover:shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenu(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-bg-surface border-t border-border animate-fade-in">
          <div className="px-4 pt-3 pb-4 space-y-1">
            <MobileNavLink to="/"         active={isActive('/')}>Home</MobileNavLink>
            <MobileNavLink to="/pilots"   active={isActive('/pilots')}>Find Pilots</MobileNavLink>
            <MobileNavLink to="/services" active={isActive('/services')}>Services</MobileNavLink>
            <MobileNavLink to="/about"    active={isActive('/about')}>About</MobileNavLink>
            <MobileNavLink to="/contact"  active={isActive('/contact')}>Contact</MobileNavLink>

            <div className="pt-4 border-t border-border space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                  >
                    <FaUser className="text-gold text-xs" />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-lg text-rose hover:bg-rose/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-xl text-center font-semibold bg-gradient-gold text-bg-base"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'text-gold'
        : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
    }`}
  >
    {children}
    {active && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gold rounded-full" />}
  </Link>
);

const MobileNavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-gold/10 text-gold'
        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
    }`}
  >
    {children}
  </Link>
);

export default EnhancedNavbar;
