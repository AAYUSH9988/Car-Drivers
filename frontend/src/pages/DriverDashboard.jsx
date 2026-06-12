import usePageTitle from '../hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { endpoints } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

const DriverDashboard = () => {
  usePageTitle('Pilot Earnings');
  const { user } = useAuth();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await endpoints.drivers.getMyEarnings();
        setData(res.data?.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load earnings');
        toast.error('Failed to load earnings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-px h-12 bg-primary animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="border border-error/30 bg-error-container/20 p-8 text-center max-w-md">
          <p className="font-ui-label text-ui-label uppercase tracking-widest text-error mb-4">Error</p>
          <p className="font-body-lg text-body-lg text-primary mb-6">{error || 'Driver profile not found'}</p>
          <p className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            Make sure your driver profile is registered and active.
          </p>
        </div>
      </div>
    );
  }

  const { earnings, stats, recentTrips } = data;

  const earningsCards = [
    { label: 'Total Earned', value: `₹${(earnings?.total || 0).toLocaleString('en-IN')}` },
    { label: 'Pending Payout', value: `₹${(earnings?.pending || 0).toLocaleString('en-IN')}` },
    { label: 'Withdrawn', value: `₹${(earnings?.withdrawn || 0).toLocaleString('en-IN')}` },
    { label: 'Total Trips', value: stats?.totalTrips || 0 },
  ];

  return (
    <div className="w-full bg-background min-h-screen pb-section-gap">

      {/* Header */}
      <section className="pt-24 md:pt-section-gap pb-16 px-gutter md:px-margin-edge border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8">
            <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">Pilot Earnings</span>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary italic">{user?.name || 'Pilot'}</h1>
            <div className="w-16 h-px bg-primary mt-6" />
          </div>
          <div className="lg:col-span-4 lg:flex lg:justify-end lg:items-end mt-8 lg:mt-0">
            {stats?.rating > 0 && (
              <div className="flex items-center gap-3">
                <span className="font-numbers text-[48px] text-primary leading-none tabular-nums">
                  {stats.rating.toFixed(1)}
                </span>
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`material-symbols-outlined text-[14px] ${i < Math.floor(stats.rating) ? 'text-primary' : 'text-outline-variant'}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <span className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {stats.totalRatings} ratings
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Earnings Stats */}
      <section className="px-gutter md:px-margin-edge pt-12 pb-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="border-t border-primary mb-12" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {earningsCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">{card.label}</span>
                <div className="font-numbers text-[36px] sm:text-[48px] text-primary leading-none tabular-nums">{card.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Trips */}
      <section className="px-gutter md:px-margin-edge">
        <div className="max-w-[1440px] mx-auto">
          <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-8">Recent Trips</span>

          {recentTrips?.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display-lg text-display-lg text-primary mb-4">No completed trips yet</p>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-md mx-auto">
                Your completed trips and earnings will appear here.
              </p>
              <Link
                to="/pilots"
                className="inline-block border border-primary px-8 py-4 font-ui-button text-ui-button uppercase tracking-widest text-primary hover:bg-primary hover:text-on-primary transition-colors"
              >
                View Fleet
              </Link>
            </div>
          ) : (
            <div className="border-t border-primary">
              {recentTrips.map((trip, i) => (
                <TripRow key={trip._id || i} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const TripRow = ({ trip }) => {
  const date  = new Date(trip.startTime);
  const day   = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const earned = trip.driverEarning ?? Math.round(trip.totalAmount * 0.85);

  return (
    <div className="border-b border-outline-variant py-8 grid grid-cols-1 md:grid-cols-12 gap-gutter">
      {/* Date */}
      <div className="md:col-span-2">
        <span className="font-numbers text-[48px] md:text-[56px] text-primary leading-none tabular-nums">{day}</span>
        <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mt-2">{month}</span>
      </div>

      {/* Details */}
      <div className="md:col-span-6">
        <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant mb-2">
          {trip.bookingReference || 'N/A'}
        </p>
        <p className="font-headline-lg text-[18px] text-primary mb-3">{trip.user?.name || 'Passenger'}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Pickup</span>
            <span className="font-body-md text-body-md text-primary">{trip.pickupLocation || '—'}</span>
          </div>
          <div>
            <span className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Time</span>
            <span className="font-body-md text-body-md text-primary">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Earnings */}
      <div className="md:col-span-4 md:col-start-9 flex flex-col justify-center md:items-end gap-2">
        <span className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant">Your Earnings</span>
        <span className="font-numbers text-[40px] text-primary leading-none tabular-nums">₹{earned.toLocaleString('en-IN')}</span>
        <span className="font-ui-label text-[10px] uppercase tracking-widest text-on-surface-variant">
          of ₹{(trip.totalAmount || 0).toLocaleString('en-IN')} total
        </span>
      </div>
    </div>
  );
};

export default DriverDashboard;
