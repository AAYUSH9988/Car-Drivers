import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield, AlertCircle } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-admin-bg">
      {/* Left side - Brand area */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-admin-accent/10 to-admin-void" />
        <div className="relative w-full h-full flex flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <Shield size={28} className="text-admin-accent" strokeWidth={1.5} />
            <span className="text-admin-text-1 font-semibold text-lg">GoPilot</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-admin-text-1">
              Admin Dashboard
            </h1>
            <p className="text-admin-text-2 max-w-sm leading-relaxed">
              Manage drivers, users, and bookings from a single, centralized interface.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="px-4 py-3 bg-admin-surface border border-admin-border rounded-md">
              <p className="text-2xl font-semibold text-admin-text-1 font-mono">99.9%</p>
              <p className="text-2xs text-admin-text-3 uppercase tracking-wide mt-1">Uptime</p>
            </div>
            <div className="px-4 py-3 bg-admin-surface border border-admin-border rounded-md">
              <p className="text-2xl font-semibold text-admin-text-1 font-mono">24/7</p>
              <p className="text-2xs text-admin-text-3 uppercase tracking-wide mt-1">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-admin-text-1 mb-1">Welcome back</h2>
            <p className="text-sm text-admin-text-3">Sign in to your admin account</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3 mb-6">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-admin-text-2 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="w-full bg-admin-elevated border border-admin-border rounded-md px-4 py-2.5 text-sm text-admin-text-1 placeholder-admin-text-3 outline-none focus:border-admin-border-alt transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text-2 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-admin-elevated border border-admin-border rounded-md px-4 py-2.5 text-sm text-admin-text-1 placeholder-admin-text-3 outline-none focus:border-admin-border-alt transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-admin-accent hover:bg-admin-accent-dim text-white text-sm font-medium rounded-md px-4 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-2xs text-admin-text-3">
            Secure admin access only. Unauthorized attempts are logged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
