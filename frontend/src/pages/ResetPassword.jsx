import usePageTitle from '../hooks/usePageTitle';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { endpoints } from '../services/api';

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const ResetPassword = () => {
  usePageTitle('New Password');
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!PASSWORD_RULES.test(password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and a number.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await endpoints.auth.resetPassword(token, password);
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-gutter py-16">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">
            New Password
          </h1>
          <div className="w-16 h-px bg-primary mt-4 mb-6" />
          <p className="font-body-md text-body-md text-on-surface-variant">
            Choose a strong password for your account.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 border border-error/30 bg-error-container/20 text-error">
            <p className="font-ui-label text-ui-label uppercase tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="group">
            <label className="block font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant mb-2 transition-colors group-focus-within:text-primary">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
                placeholder="Enter new password"
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
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-0.5 flex-1 transition-colors duration-300 ${i <= strength ? strengthColor(strength) : 'bg-outline-variant'}`} />
                  ))}
                </div>
                <p className="font-ui-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                  {strengthLabel(strength)}
                </p>
              </div>
            )}
          </div>

          <div className="group">
            <label className="block font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant mb-2 transition-colors group-focus-within:text-primary">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(''); }}
              required
              placeholder="Confirm new password"
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 font-body-md text-body-md text-primary placeholder-outline transition-colors outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-4 bg-primary text-on-primary font-ui-button text-ui-button uppercase tracking-[0.15em] hover:bg-inverse-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Spinner />
                RESETTING...
              </>
            ) : 'RESET PASSWORD'}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-outline-variant/30 pt-8">
          <Link
            to="/login"
            className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

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

const strengthColor = (s) => ['', 'bg-error', 'bg-tertiary-container', 'bg-outline', 'bg-on-surface-variant', 'bg-primary'][s];
const strengthLabel = (s) => ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][s];

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default ResetPassword;
