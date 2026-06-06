import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/images/logo/GoPilot-logo.png';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Panel — Branding */}
          <div className="hidden lg:flex flex-col justify-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img src={logo} alt="GoPilot" className="h-10 w-auto" />
                <span className="font-heading font-bold text-2xl text-text-primary">
                  Go<span className="text-gold">Pilot</span>
                </span>
              </div>
              <h1 className="font-heading text-4xl font-bold text-text-primary leading-tight">
                Experience journeys<br />
                <span className="text-gold">beyond ordinary</span>
              </h1>
              <p className="text-text-secondary text-lg max-w-md">
                Sign in to access your bookings, manage your trips, and discover
                professional drivers across the city.
              </p>
              <div className="flex items-center gap-8 pt-4">
                <StatBadge value="4.9" label="Avg Rating" />
                <StatBadge value="50K+" label="Trips" />
                <StatBadge value="10K+" label="Riders" />
              </div>
            </div>
          </div>

          {/* Right Panel — Form */}
          <div className="bg-bg-surface border border-border rounded-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
                <img src={logo} alt="GoPilot" className="h-8 w-auto" />
                <span className="font-heading font-bold text-xl text-text-primary">
                  Go<span className="text-gold">Pilot</span>
                </span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Don't have an account?{' '}
                <Link to="/register" className="text-gold hover:text-gold-light font-medium transition-colors">
                  Register
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-rose/10 border border-rose/20 rounded-xl text-rose text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Email Address"
                name="email"
                type="email"
                icon={<FaEnvelope className="text-text-muted" />}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                error={error}
                required
              />

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">{<FaLock className="text-text-muted" />}</span>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    aria-invalid={!!error}
                    required
                    className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-12 py-3
                      text-text-primary placeholder:text-text-muted
                      focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
                  <input type="checkbox" className="rounded border-border bg-bg-elevated text-gold focus:ring-gold" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-gold hover:text-gold-light transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-gold text-bg-base font-semibold rounded-xl
                  hover:shadow-glow-gold hover:scale-[1.01] active:scale-[0.99]
                  transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, type, icon, placeholder, value, onChange, error, required }) => (
  <div>
    <label htmlFor={name} className="block text-sm text-text-secondary mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</span>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        required={required}
        className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-4 py-3
          text-text-primary placeholder:text-text-muted
          focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-colors"
      />
    </div>
  </div>
);

const StatBadge = ({ value, label }) => (
  <div>
    <div className="text-2xl font-bold text-gold">{value}</div>
    <div className="text-xs text-text-secondary">{label}</div>
  </div>
);

const Spinner = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default Login;
