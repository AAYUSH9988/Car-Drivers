import usePageTitle from '../hooks/usePageTitle';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { endpoints } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

const Dashboard = () => {
  usePageTitle('Command Center');
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [reviewModal, setReviewModal] = useState(null); // booking object or null
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await endpoints.bookings.getAll();
      setBookings(res.data?.data || []);
    } catch {
      setError('Failed to load bookings');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await endpoints.bookings.cancel(bookingId);
      toast.success('Booking cancelled successfully');
      setBookings(prev =>
        prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleReviewSubmit = (bookingId, reviewData) => {
    setBookings(prev =>
      prev.map(b => b._id === bookingId ? { ...b, review: reviewData } : b)
    );
    setReviewModal(null);
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : filter === 'upcoming'
      ? bookings.filter(b => ['pending', 'confirmed'].includes(b.status))
      : bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  const upcoming = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
  const completed = bookings.filter(b => b.status === 'completed');

  const stats = [
    { value: bookings.length, label: 'Total Bookings' },
    { value: upcoming.length, label: 'Upcoming' },
    { value: completed.length, label: 'Completed' },
    { value: `₹${bookings.reduce((a, b) => a + (b.totalAmount || 0), 0).toFixed(0)}`, label: 'Total Spent' },
  ];

  if (loading) {
    return (
      <div className="w-full bg-background min-h-screen">
        <section className="pt-24 md:pt-section-gap pb-16 px-gutter md:px-margin-edge border-b border-outline-variant">
          <div className="max-w-[1440px] mx-auto">
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">Command Center</span>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary italic">{user?.name || 'Guest'}</h1>
          </div>
        </section>
        <section className="min-h-[40vh] flex items-center justify-center">
          <div className="w-px h-12 bg-primary animate-pulse" />
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-background min-h-screen">
        <section className="px-gutter md:px-margin-edge py-12">
          <div className="max-w-[1440px] mx-auto border border-error/30 bg-error-container/20 p-6">
            <p className="font-ui-label text-ui-label uppercase tracking-widest text-error">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-6 bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-tertiary-container transition-colors"
            >
              Retry
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full bg-background min-h-screen pb-section-gap">
      {/* Header */}
      <section className="pt-24 md:pt-section-gap pb-16 px-gutter md:px-margin-edge border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8">
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">Command Center</span>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary italic">{user?.name || 'Guest'}</h1>
            <div className="w-16 h-px bg-primary mt-6" />
          </div>
          <div className="lg:col-span-4 lg:flex lg:justify-end lg:items-end mt-8 lg:mt-0 gap-4 flex flex-wrap">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 border border-outline-variant px-5 py-3 font-ui-button text-ui-button uppercase tracking-widest text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
              Profile
            </Link>
            <Link
              to="/pilots"
              className="inline-flex items-center gap-2 border border-primary px-5 py-3 font-ui-button text-ui-button uppercase tracking-widest text-primary hover:bg-primary hover:text-on-primary transition-colors"
            >
              Book a Pilot
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-gutter md:px-margin-edge pt-12 pb-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="border-t border-primary mb-12" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i}>
                <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">{stat.label}</span>
                <div className="font-numbers text-[36px] sm:text-[48px] text-primary leading-none tabular-nums">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservations */}
      <section className="px-gutter md:px-margin-edge">
        <div className="max-w-[1440px] mx-auto">
          <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-8">Reservations</span>

          {/* Tabs */}
          <div className="flex border-b border-outline-variant mb-8">
            <Tab label="All" active={filter === 'all'} onClick={() => setFilter('all')} count={bookings.length} />
            <Tab label="Upcoming" active={filter === 'upcoming'} onClick={() => setFilter('upcoming')} count={upcoming.length} />
            <Tab label="Past" active={filter === 'past'} onClick={() => setFilter('past')} count={completed.length} />
          </div>

          {/* List */}
          {filteredBookings.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="border-t border-primary">
              {filteredBookings.map((booking) => (
                <BookingRow
                  key={booking._id}
                  booking={booking}
                  cancellingId={cancellingId}
                  onCancel={handleCancel}
                  onReview={() => setReviewModal(booking)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          booking={reviewModal}
          onClose={() => setReviewModal(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

/* ─── Sub Components ─── */

const Tab = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`relative px-6 py-4 font-ui-label text-ui-label uppercase tracking-widest transition-colors ${
      active ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
    }`}
  >
    {label}
    {count > 0 && <span className="ml-2 text-on-surface-variant">{count}</span>}
    {active && <div className="absolute bottom-0 left-0 right-0 h-px bg-primary" />}
  </button>
);

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const CANCELLABLE = ['pending', 'confirmed'];

const BookingRow = ({ booking, cancellingId, onCancel, onReview }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const startDate = new Date(booking.startTime);
  const day = startDate.getDate().toString().padStart(2, '0');
  const month = startDate.toLocaleString('default', { month: 'short' }).toUpperCase();

  const isCancelling = cancellingId === booking._id;
  const canCancel = CANCELLABLE.includes(booking.status);
  const canReview = booking.status === 'completed' && !booking.review;

  return (
    <div className="border-b border-outline-variant py-8 grid grid-cols-1 md:grid-cols-12 gap-gutter hover:bg-surface-container-low transition-colors">
      {/* Date */}
      <div className="md:col-span-2">
        <span className="font-numbers text-[48px] md:text-[64px] text-primary leading-none tabular-nums">{day}</span>
        <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mt-2">{month}</span>
      </div>

      {/* Details */}
      <div className="md:col-span-5">
        <h3 className="font-headline-lg text-headline-lg-mobile text-primary mb-2">
          {booking.driver?.name || 'Unknown Pilot'}
        </h3>
        <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
          Ref: {booking.bookingReference || 'N/A'}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <DetailItem label="Time" value={startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
          <DetailItem label="Pickup" value={booking.pickupLocation || 'N/A'} />
        </div>
        {booking.review && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`material-symbols-outlined text-[14px] ${i < booking.review.rating ? 'text-primary' : 'text-outline-variant'}`}>
                  star
                </span>
              ))}
            </div>
            <span className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant">Your Review</span>
          </div>
        )}
      </div>

      {/* Status, Amount & Actions */}
      <div className="md:col-span-4 md:col-start-9 flex flex-col justify-between md:items-end gap-4">
        <div className="flex flex-col md:items-end gap-2">
          <span className={`font-ui-label text-ui-label uppercase tracking-widest ${
            booking.status === 'cancelled' ? 'text-error' : 'text-primary'
          }`}>
            {STATUS_LABELS[booking.status] || booking.status}
          </span>
          <span className="font-numbers text-[32px] text-primary leading-none tabular-nums">₹{booking.totalAmount}</span>
        </div>

        <div className="flex flex-wrap gap-3 md:justify-end">
          {canReview && (
            <button
              onClick={onReview}
              className="font-ui-label text-ui-label uppercase tracking-widest text-primary border border-primary px-4 py-2 hover:bg-primary hover:text-on-primary transition-colors text-xs"
            >
              Leave Review
            </button>
          )}
          {canCancel && !showConfirm && (
            <button
              onClick={() => setShowConfirm(true)}
              className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant border border-outline-variant px-4 py-2 hover:border-error hover:text-error transition-colors text-xs"
            >
              Cancel
            </button>
          )}
          {canCancel && showConfirm && (
            <div className="flex gap-2">
              <button
                onClick={() => { onCancel(booking._id); setShowConfirm(false); }}
                disabled={isCancelling}
                className="font-ui-label text-ui-label uppercase tracking-widest text-on-primary bg-error px-4 py-2 hover:opacity-80 transition-opacity text-xs disabled:opacity-50"
              >
                {isCancelling ? '...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant border border-outline-variant px-4 py-2 hover:border-primary hover:text-primary transition-colors text-xs"
              >
                Keep
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-1">{label}</span>
    <span className="font-body-md text-body-md text-primary">{value}</span>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-24">
    <p className="font-display-lg text-display-lg text-primary mb-4">No reservations</p>
    <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-md mx-auto">
      Your journey awaits. Discover our curated fleet and secure your first booking.
    </p>
    <Link
      to="/pilots"
      className="inline-block border border-primary px-8 py-4 font-ui-button text-ui-button uppercase tracking-widest text-primary hover:bg-primary hover:text-on-primary transition-colors"
    >
      Browse Fleet
    </Link>
  </div>
);

/* ─── Review Modal ─── */

const ReviewModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      await endpoints.bookings.review(booking._id, { rating, comment: comment.trim() });
      toast.success('Review submitted. Thank you!');
      onSubmit(booking._id, { rating, comment: comment.trim() });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border border-primary w-full max-w-md p-6 md:p-8"
      >
        <div className="flex justify-between items-start mb-8 border-b border-outline-variant pb-4">
          <div>
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-2">Review</span>
            <h2 className="font-headline-lg text-headline-lg-mobile text-primary">
              Rate {booking.driver?.name || 'Your Pilot'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-primary transition-colors" aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Star Rating */}
          <div>
            <label className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`${star} star`}
                >
                  <span className={`material-symbols-outlined text-[32px] transition-colors ${
                    star <= (hovered || rating) ? 'text-primary' : 'text-outline-variant'
                  }`}>
                    star
                  </span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="font-ui-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              maxLength={500}
              className="w-full bg-transparent border border-outline-variant focus:border-primary focus:ring-0 px-3 py-2 font-body-md text-body-md text-primary placeholder-outline-variant outline-none transition-colors resize-none"
            />
            <p className="font-ui-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 text-right">
              {comment.length}/500
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || rating === 0}
            className="w-full py-4 bg-primary text-on-primary font-ui-button text-ui-button uppercase tracking-[0.15em] hover:bg-tertiary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Dashboard;
