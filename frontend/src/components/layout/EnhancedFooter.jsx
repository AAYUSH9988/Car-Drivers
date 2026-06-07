import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const footerLinks = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Fleet Logistics', to: '/services' },
];

const EnhancedFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface w-full pt-section-gap pb-12 border-t border-outline">
      <div className="max-w-[1440px] mx-auto px-gutter md:px-margin-edge">
        {/* Brand Logo */}
        <div className="font-display-xl text-[48px] sm:text-[64px] md:text-display-xl text-primary leading-none text-left mb-12 tracking-tighter">
          GOPILOT
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:gap-0 mt-8 border-t border-outline-variant pt-8">
          {/* Links */}
          <div className="flex flex-col gap-4">
            {footerLinks.map((link, index) => (
              <LinkOrA
                key={index}
                to={link.to}
                href={link.href}
                className="font-body-md text-body-md text-on-secondary-container hover:text-tertiary-container transition-all opacity-100 hover:opacity-80"
              >
                {link.label}
              </LinkOrA>
            ))}
          </div>

          {/* Copyright */}
          <div className="font-body-md text-body-md text-on-surface-variant max-w-xs md:text-right">
            &copy; {currentYear} GOPILOT. ALL RIGHTS RESERVED. PRIVATE CLASSIFIED.
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper to handle external vs internal links
const LinkOrA = ({ to, href, children, className }) => {
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
};

export default EnhancedFooter;
