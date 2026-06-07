import usePageTitle from '../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { endpoints } from '../services/api';

const VerifyEmail = () => {
  usePageTitle('Verify Email');
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setMessage('Invalid verification link.');
        setStatus('error');
        return;
      }
      try {
        const res = await endpoints.auth.verifyEmail(token);
        setMessage(res.data?.message || 'Email verified successfully!');
        setStatus('success');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired or already been used.');
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-px h-12 bg-primary animate-pulse mx-auto mb-6" />
          <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">Verifying your email...</p>
        </div>
      </div>
    );
  }

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-gutter py-16">
      <div className="max-w-md w-full text-center">
        <div className={`w-20 h-20 flex items-center justify-center mx-auto mb-8 ${isSuccess ? 'bg-primary' : 'border border-error/30 bg-error-container/20'}`}>
          <span className={`material-symbols-outlined text-[32px] ${isSuccess ? 'text-on-primary' : 'text-error'}`}>
            {isSuccess ? 'verified' : 'error'}
          </span>
        </div>

        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
          {isSuccess ? 'Email Verified' : 'Verification Failed'}
        </h1>
        <div className="w-16 h-px bg-primary mx-auto mb-6" />

        <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">{message}</p>

        {isSuccess ? (
          <Link
            to="/login"
            className="inline-block bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-tertiary-container transition-colors"
          >
            Proceed to Sign In
          </Link>
        ) : (
          <div className="space-y-4">
            <Link
              to="/forgot-password"
              className="inline-block bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-tertiary-container transition-colors"
            >
              Request New Link
            </Link>
            <div className="mt-4">
              <Link
                to="/login"
                className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
