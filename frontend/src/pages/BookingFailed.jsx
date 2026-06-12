import usePageTitle from '../hooks/usePageTitle';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { endpoints } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const BookingFailed = () => {
  usePageTitle('Payment Failed');
  const navigate = useNavigate();
  const location = useLocation();
  const { user }  = useAuth();

  const booking = location.state?.booking;
  const driver  = location.state?.driver;
  const reason  = location.state?.reason || 'Your payment could not be processed.';

  const [retrying,   setRetrying]   = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!booking) navigate('/');
  }, [booking, navigate]);

  if (!booking) return null;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const orderRes = await endpoints.payments.createOrder({ bookingId: booking._id });
      if (!orderRes.data?.success) throw new Error('Failed to create payment order');

      const { orderId, amount, currency, keyId } = orderRes.data.data;

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Payment gateway unavailable. Please try again.');
        setRetrying(false);
        return;
      }

      const rzp = new window.Razorpay({
        key:         keyId,
        amount,
        currency,
        name:        'GoPilot',
        description: `Booking with ${driver?.name || 'Pilot'}`,
        order_id:    orderId,
        prefill:     { name: user?.name || '', email: user?.email || '' },
        theme:       { color: '#1b1c1c' },
        handler: async (paymentResponse) => {
          try {
            const verifyRes = await endpoints.payments.verify({
              razorpay_order_id:   paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature:  paymentResponse.razorpay_signature,
              bookingId:           booking._id,
            });
            if (verifyRes.data?.success) {
              toast.success('Payment successful! Booking confirmed.');
              navigate('/booking/success', {
                state: { booking: { ...booking, status: 'confirmed' }, driver },
              });
            } else {
              throw new Error('Verification failed');
            }
          } catch {
            toast.error('Payment verification failed. Contact support.');
            setRetrying(false);
          }
        },
        modal: {
          ondismiss: () => setRetrying(false),
        },
      });

      rzp.on('payment.failed', (res) => {
        toast.error(`Payment failed: ${res.error?.description || 'Unknown error'}`);
        setRetrying(false);
      });

      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setRetrying(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await endpoints.bookings.cancel(booking._id);
      toast.success('Booking cancelled successfully.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
      setCancelling(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface flex items-center justify-center px-gutter md:px-margin-edge py-24">
      <div className="max-w-2xl w-full text-center">

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, delay: 0.1 }}
          className="inline-block mb-8"
        >
          <div className="w-20 h-20 border-2 border-error flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-error">close</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4"
        >
          Payment Unsuccessful
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-body-lg text-body-lg text-on-surface-variant mb-12"
        >
          {reason}
        </motion.p>

        {/* Details card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="border border-primary bg-background text-left"
        >
          <div className="p-6 md:p-8 border-b border-primary">
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-6">
              Booking Details
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailRow label="Booking ID"    value={booking.bookingReference || booking._id?.toString().slice(0, 12).toUpperCase()} />
              {driver && <DetailRow label="Pilot"        value={driver.name} />}
              <DetailRow label="Total Amount" value={`₹${(booking.totalAmount || 0).toLocaleString('en-IN')}`} />
              <DetailRow label="Status"       value="Pending Payment" />
            </div>
          </div>

          {/* Primary actions */}
          <div className="p-6 md:p-8 border-b border-primary">
            <p className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-4">
              What would you like to do?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Retry — only for cancellable statuses */}
              {['pending', 'confirmed'].includes(booking.status) && (
                <button
                  onClick={handleRetry}
                  disabled={retrying || cancelling}
                  className="flex-1 bg-primary text-on-primary font-ui-button text-ui-button uppercase py-4 tracking-widest hover:bg-tertiary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {retrying ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      Processing…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">refresh</span>
                      Retry Payment
                    </>
                  )}
                </button>
              )}
              {/* Cancel booking */}
              {['pending', 'confirmed'].includes(booking.status) && (
                <button
                  onClick={handleCancel}
                  disabled={retrying || cancelling}
                  className="flex-1 border border-error text-error font-ui-button text-ui-button uppercase py-4 tracking-widest hover:bg-error hover:text-on-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelling…' : 'Cancel Booking'}
                </button>
              )}
            </div>
          </div>

          {/* Secondary navigation */}
          <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 border border-primary text-primary font-ui-button text-ui-button uppercase py-3 tracking-widest hover:bg-primary hover:text-on-primary transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/pilots')}
              className="flex-1 border border-outline-variant text-on-surface-variant font-ui-button text-ui-button uppercase py-3 tracking-widest hover:border-primary hover:text-primary transition-colors"
            >
              Browse Pilots
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-1">{label}</span>
    <span className="font-body-md text-body-md text-primary">{value}</span>
  </div>
);

export default BookingFailed;
