import usePageTitle from '../hooks/usePageTitle';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingSuccess = () => {
  usePageTitle('Booking Confirmed');
  const navigate = useNavigate();
  const location = useLocation();

  const booking = location.state?.booking;
  const driver = location.state?.driver;

  useEffect(() => {
    if (!booking) {
      navigate('/');
    }
  }, [booking, navigate]);

  if (!booking || !driver) {
    return null;
  }

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const duration = Math.round((endDate - startDate) / (1000 * 60 * 60) * 10) / 10;

  return (
    <div className="w-full min-h-screen bg-surface flex items-center justify-center px-gutter md:px-margin-edge py-24">
      <div className="max-w-2xl w-full text-center">
        {/* Status */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, delay: 0.1 }}
          className="inline-block mb-8"
        >
          <div className="w-20 h-20 bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-on-primary">check</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4"
        >
          Booking Confirmed
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-body-lg text-body-lg text-on-surface-variant mb-12"
        >
          Your pilot has been notified. All details are below.
        </motion.p>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="border border-primary bg-background text-left"
        >
          <div className="p-6 md:p-8 border-b border-primary">
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-6">
              Reservation Details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailRow label="Booking ID" value={booking._id?.toString().slice(0, 12).toUpperCase()} />
              <DetailRow label="Pilot" value={driver.name} />
              <DetailRow label="Date & Time" value={startDate.toLocaleString()} />
              <DetailRow label="Duration" value={`${duration} hours`} />
              <DetailRow label="Pickup" value={booking.pickupLocation} />
              <DetailRow label="Drop-off" value={booking.dropLocation || booking.dropoffLocation || 'N/A'} />
              <DetailRow label="Total" value={`₹${booking.totalAmount?.toFixed(2) || '0.00'}`} />
              <DetailRow label="Status" value={booking.status?.toUpperCase() || 'CONFIRMED'} />
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-primary text-on-primary font-ui-button text-ui-button uppercase py-4 tracking-widest hover:bg-tertiary-container transition-colors"
            >
              View Dashboard
            </button>
            <button
              onClick={() => navigate('/pilots')}
              className="flex-1 border border-primary text-primary font-ui-button text-ui-button uppercase py-4 tracking-widest hover:bg-primary hover:text-on-primary transition-colors"
            >
              Book Another
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-1">
      {label}
    </span>
    <span className="font-body-md text-body-md text-primary">
      {value}
    </span>
  </div>
);

export default BookingSuccess;
