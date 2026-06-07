import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface antialiased">
      {/* Mobile nav */}
      <nav className="md:hidden flex justify-between items-center px-gutter py-gutter border-b border-outline-variant bg-surface sticky top-0 z-50">
        <span className="font-headline-lg text-headline-lg-mobile italic tracking-tight text-primary">GoPilot</span>
        <span className="font-ui-label text-ui-label text-secondary tracking-widest uppercase">Secure Access</span>
      </nav>

      {/* Left — Brand Panel */}
      <div className="hidden md:flex md:w-1/2 relative bg-primary-container flex-col justify-end p-margin-edge overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0mfnmi32c5xegBoyiazoUiv9ZEbR9gSY93vpIFaLISLA8JlKnBjAtO9NOKv04e4pcHBi0gKVHBtUh0Np7IMAlkgO5rATUtKkYTVAvQL1hlfxpCG1Md-ll54Hq1calSH2sSU3dMyT0tN7b1JQIk29WjuLlks8kIQczuxOaxLmc24pL7zl1mVlz82KhiUYQigvCrIgob93cCG8f3uBgUTMOpJkRYkyqUUMTrqTw-sPfZzFCm5v0miIjIh7Kx9aWJLGbKMhvHJXdbEI"
            alt="Luxury vehicle interior"
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary-container via-primary-container/60 to-transparent" />
        <div className="relative z-20 text-on-primary">
          <div className="mb-gutter flex items-center space-x-2">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span className="font-ui-label text-ui-label tracking-widest uppercase opacity-70">Private Classified</span>
          </div>
          <h1 className="font-headline-lg text-display-lg text-on-primary mb-6 leading-none italic max-w-lg">
            THE GATEWAY<br />TO PRECISION
          </h1>
          <p className="font-body-lg text-body-lg opacity-70 max-w-md border-l border-on-primary pl-4">
            Elite Logistical Choreography.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-gutter py-16 md:p-margin-edge bg-surface relative min-h-[calc(100vh-80px)] md:min-h-screen">
        <div className="hidden md:block absolute top-margin-edge left-margin-edge font-headline-lg text-headline-lg-mobile italic tracking-tight text-primary opacity-10 pointer-events-none select-none">
          GoPilot
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="mb-16">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
              SIGN IN
            </h2>
            <div className="w-16 h-px bg-primary" />
          </div>

          {error && (
            <div className="mb-8 p-4 border border-error/30 bg-error-container/20 text-error">
              <p className="font-ui-label text-ui-label uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <div className="relative group">
              <label
                htmlFor="email"
                className="block font-ui-label text-ui-label uppercase text-on-surface-variant mb-2 transition-colors group-focus-within:text-primary"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                aria-invalid={!!error}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 font-body-md text-body-md text-primary placeholder-outline transition-colors outline-none"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <label
                htmlFor="password"
                className="block font-ui-label text-ui-label uppercase text-on-surface-variant mb-2 transition-colors group-focus-within:text-primary"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  aria-invalid={!!error}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 pr-8 font-body-md text-body-md text-primary placeholder-outline transition-colors outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Utility row */}
            <div className="flex items-center justify-between pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface bg-transparent cursor-pointer"
                />
                <span className="font-ui-label text-ui-label uppercase text-on-surface-variant">Remember Me</span>
              </label>
              <Link
                to="/forgot-password"
                className="font-ui-label text-ui-label uppercase text-primary border-b border-transparent hover:border-primary transition-colors pb-0.5"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <div className="pt-8 space-y-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-4 px-8 font-ui-button text-ui-button uppercase tracking-[0.15em] text-on-primary bg-primary hover:bg-inverse-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    SIGNING IN...
                  </>
                ) : (
                  'SIGN IN'
                )}
              </button>

              <div className="text-center pt-8 border-t border-outline-variant/30">
                <Link
                  to="/register"
                  className="font-ui-label text-ui-label uppercase text-on-surface-variant hover:text-primary transition-colors inline-flex items-center space-x-2 group"
                >
                  <span>Create an Account</span>
                  <span className="material-symbols-outlined text-[16px] transform group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default Login;
