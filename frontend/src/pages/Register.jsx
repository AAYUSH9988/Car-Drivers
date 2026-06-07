import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import hangarImg from '../assets/images/Homepage/Home 2.png';

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!PASSWORD_RULES.test(formData.password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and a number.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    try {
      await register({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <main className="flex flex-col lg:flex-row min-h-screen w-full bg-background text-primary antialiased">
      {/* Left — Brand Panel */}
      <section className="relative w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-margin-edge bg-primary text-on-primary overflow-hidden min-h-[400px] lg:min-h-screen">
        <div
          className="absolute inset-0 z-0 opacity-30 mix-blend-luminosity bg-cover bg-center"
          style={{ backgroundImage: `url(${hangarImg})` }}
          role="presentation"
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />

        {/* Brand anchor */}
        <header className="relative z-10 pt-4 lg:pt-0">
          <Link
            to="/"
            className="font-headline-lg text-headline-lg-mobile md:text-headline-lg tracking-tighter uppercase inline-block hover:opacity-70 transition-opacity italic"
          >
            GOPILOT
          </Link>
        </header>

        {/* Core message */}
        <div className="relative z-10 flex flex-col gap-6 lg:gap-8 max-w-lg mt-12 lg:mt-0 lg:pl-[12.5%]">
          <h1 className="font-headline-lg text-display-lg italic leading-none">
            Join the<br />Elite
          </h1>
          <p className="font-body-lg text-body-lg text-on-primary/80 leading-relaxed max-w-sm">
            Step into a world where absolute logistical choreography meets unparalleled luxury.
          </p>
        </div>

        {/* Trust metrics */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-8 lg:gap-16 pt-12 lg:pt-16 border-t border-on-primary/20 mt-12 lg:mt-auto">
          <div className="flex flex-col gap-1">
            <span className="font-headline-lg text-headline-lg-mobile md:text-headline-lg">500+</span>
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-primary/60">Elite Pilots</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-headline-lg text-headline-lg-mobile md:text-headline-lg">4.9★</span>
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-primary/60">Avg Rating</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-headline-lg text-headline-lg-mobile md:text-headline-lg">50K+</span>
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-primary/60">Trips</span>
          </div>
        </div>
      </section>

      {/* Right — Form */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-margin-edge bg-background text-primary">
        <div className="w-full max-w-md flex flex-col gap-10">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg">Apply for Access</h2>
            <p className="font-body-md text-body-md text-secondary">
              Submit your details below. Strict confidentiality is maintained.
            </p>
          </div>

          {error && (
            <div className="p-4 border border-error/30 bg-error-container/20 text-error">
              <p className="font-ui-label text-ui-label uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Full Name */}
            <Field label="Full Name" htmlFor="fullName">
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                aria-invalid={!!error}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-body-md text-body-md transition-colors outline-none placeholder:text-transparent"
                placeholder="Full Name"
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" htmlFor="email">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                aria-invalid={!!error}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-body-md text-body-md transition-colors outline-none placeholder:text-transparent"
                placeholder="Email Address"
              />
            </Field>

            {/* Phone */}
            <Field label="Phone Number" htmlFor="phone">
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-body-md text-body-md transition-colors outline-none placeholder:text-transparent"
                placeholder="Phone Number"
              />
            </Field>

            {/* Password row */}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-6">
              <Field label="Password" htmlFor="password" className="w-full">
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    aria-invalid={!!error}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 pr-7 font-body-md text-body-md transition-colors outline-none placeholder:text-transparent"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {formData.password && (
                  <PasswordStrength strength={passwordStrength} />
                )}
              </Field>

              <Field label="Confirm Password" htmlFor="confirmPassword" className="w-full">
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    aria-invalid={!!error}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 pr-7 font-body-md text-body-md transition-colors outline-none placeholder:text-transparent"
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showConfirm ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </Field>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 bg-primary text-on-primary py-5 px-8 font-ui-button text-ui-button uppercase tracking-[0.15em] hover:bg-inverse-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    SUBMITTING...
                  </>
                ) : (
                  'SIGN UP'
                )}
              </button>
            </div>
          </form>

          {/* Legal */}
          <div className="border-t border-outline-variant pt-8">
            <p className="font-ui-label text-[10px] md:text-ui-label text-secondary leading-relaxed uppercase tracking-widest">
              BY REGISTERING, YOU AGREE TO OUR{' '}
              <Link to="/terms" className="text-primary hover:italic transition-all">TERMS OF SERVICE</Link>
              {' '}AND{' '}
              <Link to="/privacy" className="text-primary hover:italic transition-all">PRIVACY POLICY</Link>.{' '}
              ALREADY HAVE AN ACCOUNT?{' '}
              <Link to="/login" className="text-primary hover:italic transition-all">SIGN IN</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

const Field = ({ label, htmlFor, children, className = '' }) => (
  <div className={`flex flex-col relative group ${className}`}>
    <label
      htmlFor={htmlFor}
      className="font-ui-label text-ui-label uppercase tracking-widest text-secondary mb-2 transition-colors group-focus-within:text-primary"
    >
      {label}
    </label>
    {children}
  </div>
);

const getPasswordStrength = (password) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const PasswordStrength = ({ strength }) => {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const colors = ['', 'bg-error', 'bg-tertiary-container', 'bg-outline', 'bg-on-surface-variant', 'bg-primary'];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-0.5 flex-1 transition-colors duration-300 ${i <= strength ? colors[strength] : 'bg-outline-variant'}`}
          />
        ))}
      </div>
      <p className="font-ui-label text-[10px] text-on-surface-variant uppercase tracking-widest">
        {labels[strength]}
      </p>
    </div>
  );
};

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default Register;
