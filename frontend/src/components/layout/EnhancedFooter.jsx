import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPhoneAlt,
         FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import logoImg from '../../assets/images/logo/GoPilot-logo.png';

const SocialLink = ({ href, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-8 h-8 rounded-full bg-bg-elevated hover:bg-electric/20 border border-border hover:border-electric/30 flex items-center justify-center transition-all"
  >
    {icon}
  </a>
);

const FooterLink = ({ to, children }) => (
  <li>
    <Link to={to} className="text-text-secondary hover:text-gold transition-colors text-sm">
      {children}
    </Link>
  </li>
);

const EnhancedFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-surface border-t border-border text-text-primary">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <img src={logoImg} alt="GoPilot" className="h-8 w-auto" />
              <span className="font-heading font-bold text-lg text-text-primary">
                Go<span className="text-gold">Pilot</span>
              </span>
            </Link>
            <p className="text-text-secondary text-sm mb-6 max-w-xs leading-relaxed">
              GoPilot provides professional drivers for all your transportation needs,
              ensuring safe, reliable, and comfortable journeys.
            </p>
            <div className="flex space-x-3">
              <SocialLink href="https://facebook.com" icon={<FaFacebookF className="text-text-secondary text-xs" />} />
              <SocialLink href="https://twitter.com" icon={<FaTwitter className="text-text-secondary text-xs" />} />
              <SocialLink href="https://instagram.com" icon={<FaInstagram className="text-text-secondary text-xs" />} />
              <SocialLink href="https://linkedin.com" icon={<FaLinkedinIn className="text-text-secondary text-xs" />} />
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-text-primary mb-6 uppercase tracking-wider">
              Our Services
            </h3>
            <ul className="space-y-3">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/services">Our Services</FooterLink>
              <FooterLink to="/pilots">Find a Pilot</FooterLink>
              <FooterLink to="/contact">Contact Us</FooterLink>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-text-primary mb-6 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <FooterLink to="/services">Airport Transfers</FooterLink>
              <FooterLink to="/services">Corporate Travel</FooterLink>
              <FooterLink to="/services">City Transfers</FooterLink>
              <FooterLink to="/services">Special Events</FooterLink>
              <FooterLink to="/services">Hourly Hire</FooterLink>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-text-primary mb-6 uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-gold mt-0.5 flex-shrink-0" />
                <span>123 Driver Street, Silicon Valley, CA 94025</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-gold flex-shrink-0" />
                <a href="tel:+1234567890" className="hover:text-gold transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-gold flex-shrink-0" />
                <a href="mailto:info@gopilot.com" className="hover:text-gold transition-colors">
                  info@gopilot.com
                </a>
              </li>
            </ul>

            <div className="mt-8">
              <h4 className="text-sm font-medium text-text-secondary mb-3">Subscribe to our newsletter</h4>
              <form className="flex" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted px-4 py-2.5 rounded-l-xl focus:outline-none focus:border-gold w-full text-sm"
                />
                <button
                  type="submit"
                  className="bg-gradient-gold text-bg-base font-semibold px-5 py-2.5 rounded-r-xl hover:shadow-glow-gold transition-all text-sm"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            &copy; {currentYear} GoPilot. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-text-muted hover:text-gold text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-text-muted hover:text-gold text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/faq" className="text-text-muted hover:text-gold text-sm transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;
