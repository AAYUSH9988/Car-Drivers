import usePageTitle from '../hooks/usePageTitle';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { endpoints } from '../services/api';

const ForgotPassword = () => {
  usePageTitle('Reset Password');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await endpoints.auth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-gutter">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-primary flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-[32px] text-on-primary">mail</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg-mobile text-primary mb-4">Check Your Email</h1>
          <div className="w-16 h-px bg-primary mx-auto mb-6" />
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
            If an account exists for <strong className="text-primary">{email}</strong>, we have sent a password reset link. Check your inbox and spam folder.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-ui-label text-ui-label uppercase tracking-widest text-primary border-b border-primary pb-0.5 hover:border-transparent transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-gutter py-16">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <Link
            to="/login"
            className="inline-flex items-center font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors mb-10 group"
          >
            <span className="material-symbols-outlined text-[16px] mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Sign In
          </Link>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">
            Reset Password
          </h1>
          <div className="w-16 h-px bg-primary mt-4 mb-6" />
          <p className="font-body-md text-body-md text-on-surface-variant">
            Enter your registered email address and we'll send you a link to reset your password.
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
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
              placeholder="Enter your email"
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
                SENDING...
              </>
            ) : 'SEND RESET LINK'}
          </button>
        </form>
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

export default ForgotPassword;
