import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import { endpoints } from '../services/api.js';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  confirmed:  { label: 'Confirmed',  color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
  'in-progress': { label: 'In Progress', color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/30' },
  completed:  { label: 'Completed',  color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  cancelled:  { label: 'Cancelled',  color: 'text-error',      bg: 'bg-error/5',   border: 'border-error/30'  },
};

const STEPS = ['pending', 'confirmed', 'in-progress', 'completed'];

const BookingTrack = () => {
  usePageTitle('Track Booking');
  const { ref } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!ref) return;
    setLoading(true);
    endpoints.bookings.track(ref)
      .then(res => setBooking(res.data?.data))
      .catch(() => setError('Booking not found. Please check the reference number.'))
      .finally(() => setLoading(false));
  }, [ref]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-px h-12 bg-primary animate-pulse" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="border border-error/30 bg-error-container/10 p-8 text-center max-w-md w-full">
          <span className="font-ui-label text-ui-label uppercase tracking-widest text-error block mb-4">Not Found</span>
          <p className="font-body-lg text-body-lg text-primary mb-6">{error || 'Booking not found.'}</p>
          <Link
            to="/pilots"
            className="inline-block border border-primary px-8 py-3 font-ui-button text-ui-button uppercase tracking-widest text-primary hover:bg-primary hover:text-on-primary transition-colors"
          >
            Browse Fleet
          </Link>
        </div>
      </div>
    );
  }

  const status  = booking.status || 'pending';
  const cfg     = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const isCancelled = status === 'cancelled';
  const stepIdx = isCancelled ? -1 : STEPS.indexOf(status);

  const startDate = booking.startTime
    ? new Date(booking.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';
  const startTime = booking.startTime
    ? new Date(booking.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '—';
  const endTime = booking.endTime
    ? new Date(booking.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '—';

  const driverName = booking.driver?.user?.name || '—';

  return (
    <div className="w-full bg-surface min-h-screen pb-section-gap">
      {/* Header */}
      <section className="pt-24 md:pt-section-gap pb-12 px-gutter md:px-margin-edge border-b border-outline-variant">
        <div className="max-w-[860px] mx-auto">
          <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">Booking Tracker</span>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
            {booking.bookingReference}
          </h1>
        </div>
      </section>

      <section className="px-gutter md:px-margin-edge pt-12">
        <div className="max-w-[860px] mx-auto space-y-8">

          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 border px-4 py-2 ${cfg.bg} ${cfg.border}`}>
            <span className={`w-2 h-2 rounded-full ${isCancelled ? 'bg-error' : 'bg-primary'}`} />
            <span className={`font-ui-label text-ui-label uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
          </div>

          {/* Progress stepper */}
          {!isCancelled && (
            <div className="flex items-center gap-0">
              {STEPS.map((step, i) => {
                const done    = i <= stepIdx;
                const current = i === stepIdx;
                const label   = step.replace('-', ' ');
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors ${
                        done ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant text-on-surface-variant'
                      } ${current ? 'ring-2 ring-primary/30' : ''}`}>
                        {done && i < stepIdx
                          ? <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                          : <span className="font-numbers text-[12px]">{i + 1}</span>
                        }
                      </div>
                      <span className={`font-ui-label text-[9px] uppercase tracking-widest ${done ? 'text-primary' : 'text-on-surface-variant/50'} capitalize whitespace-nowrap`}>
                        {label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-2 mb-5 ${i < stepIdx ? 'bg-primary' : 'bg-outline-variant'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Details grid */}
          <div className="border border-outline-variant">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <DetailCell label="Driver"    value={driverName} />
              <DetailCell label="Date"      value={startDate} />
              <DetailCell label="Time"      value={`${startTime} – ${endTime}`} />
              <DetailCell label="Pickup"    value={booking.pickupLocation || '—'} />
              <DetailCell label="Drop-off"  value={booking.dropLocation   || '—'} />
              <DetailCell label="Total"     value={booking.totalAmount != null ? `₹${Number(booking.totalAmount).toLocaleString('en-IN')}` : '—'} />
            </div>
          </div>

          {/* Share this link */}
          <div className="border border-outline-variant/50 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Share this tracking link</p>
              <p className="font-body-md text-body-md text-primary break-all">{window.location.href}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="shrink-0 border border-outline-variant px-4 py-2 font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              Copy Link
            </button>
          </div>

          <div className="pt-4">
            <Link
              to="/pilots"
              className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Fleet
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const DetailCell = ({ label, value }) => (
  <div className="border-b border-r border-outline-variant px-5 py-4 last:border-r-0 odd:border-r">
    <p className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
    <p className="font-body-md text-body-md text-primary">{value}</p>
  </div>
);

export default BookingTrack;
