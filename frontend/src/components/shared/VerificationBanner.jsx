import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { endpoints } from '../../services/api';

const VerificationBanner = () => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.isEmailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await endpoints.auth.resendVerification();
      toast.success('Verification email sent — check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full bg-tertiary-container border-b border-outline-variant px-gutter md:px-margin-edge py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[18px] text-on-tertiary-container shrink-0">
          mark_email_unread
        </span>
        <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-tertiary-container">
          Please verify your email to unlock all features
        </p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={handleResend}
          disabled={sending}
          className="font-ui-label text-ui-label uppercase tracking-widest text-on-tertiary-container underline underline-offset-2 hover:no-underline disabled:opacity-50 transition-opacity"
        >
          {sending ? 'Sending...' : 'Resend email'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="text-on-tertiary-container hover:opacity-60 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
};

export default VerificationBanner;
