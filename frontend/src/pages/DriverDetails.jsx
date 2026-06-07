import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { endpoints } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import driverService from '../services/driverService.js';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking modal
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    selectedDate: '',
    selectedTime: '',
    duration: 1,
    pickupLocation: '',
    dropoffLocation: '',
  });

  // Fetch driver
  useEffect(() => {
    let mounted = true;
    const fetchDriver = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('Driver ID not found');
        const data = await driverService.getDriverById(id);
        if (!data) throw new Error('Driver not found');
        if (mounted) setDriver(data);
      } catch (err) {
        const msg = err.message || 'Failed to load driver details';
        if (mounted) {
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDriver();
    return () => { mounted = false; };
  }, [id]);

  // Booking submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book a pilot');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const { selectedDate, selectedTime, duration, pickupLocation, dropoffLocation } = bookingData;
    if (!selectedDate || !selectedTime || !pickupLocation.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setBookingLoading(true);
    try {
      const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + parseInt(duration));

      const payload = {
        driver: driver._id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim() || pickupLocation.trim(),
        totalAmount: driver.hourlyRate * parseInt(duration),
      };

      const res = await endpoints.bookings.create(payload);

      if (res.data?.success) {
        toast.success('Booking confirmed!');
        setBookingModal(false);
        navigate('/booking/success', {
          state: { booking: res.data.data, driver }
        });
      } else {
        throw new Error(res.data?.message || 'Booking failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create booking';
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error && !driver) return <ErrorState error={error} onBack={() => navigate(-1)} />;
  if (!driver) return <NotFoundState onBack={() => navigate('/pilots')} />;

  const totalPrice = (driver.hourlyRate * bookingData.duration).toFixed(2);

  return (
    <div className="w-full bg-surface min-h-screen">
      {/* ── Hero / Header ── */}
      <section className="pt-24 md:pt-section-gap pb-16 px-gutter md:px-margin-edge border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto">
          <Link
            to="/pilots"
            className="inline-flex items-center font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors mb-6"
          >
            <span className="material-symbols-outlined text-[16px] mr-2">arrow_back</span>
            Back to Fleet
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Photo */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[3/4] bg-surface-container-high overflow-hidden border border-primary">
                <img
                  src={driver.profilePhoto || '/src/assets/images/pilots/pilot1.jpg'}
                  alt={driver.name}
                  className="w-full h-full object-cover grayscale opacity-80"
                />
                {driver.isAvailable && (
                  <div className="absolute bottom-0 left-0 bg-background border-t border-r border-primary px-3 py-2">
                    <span className="font-ui-label text-ui-label uppercase tracking-widest text-primary">
                      Available
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-6 lg:col-start-7 flex flex-col justify-between">
              <div>
                <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-4">
                  Pilot Profile
                </span>
                <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-6">
                  {driver.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="font-display-xl text-[48px] text-primary leading-none">
                    {driver.rating?.toFixed(1) || '4.5'}
                  </span>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(driver.rating || 0)}
                    </div>
                    <p className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
                      {driver.totalRatings || 0} Reviews
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4 border-t border-primary pt-6 mb-8">
                  <DetailRow label="Experience" value={`${driver.experience || 0} years`} />
                  <DetailRow label="Hourly Rate" value={`$${driver.hourlyRate || 0}`} />
                  <DetailRow label="Vehicle Types" value={driver.vehicleTypes?.join(' / ') || 'Sedan'} />
                  <DetailRow label="Languages" value={driver.languages?.join(' / ') || 'English'} />
                  {driver.certifications?.length > 0 && (
                    <DetailRow label="Certifications" value={driver.certifications.join(', ')} />
                  )}
                </div>
              </div>

              {/* Book CTA */}
              <div className="border-t border-outline-variant pt-6">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="font-display-xl text-[56px] text-primary leading-none">
                      ${driver.hourlyRate}
                    </span>
                    <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant ml-2">
                      /hr
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => driver.isAvailable && setBookingModal(true)}
                  disabled={!driver.isAvailable}
                  className={`w-full py-4 font-ui-button text-ui-button uppercase tracking-[0.15em] transition-all duration-300 ${
                    driver.isAvailable
                      ? 'bg-primary text-on-primary hover:bg-tertiary-container'
                      : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                  }`}
                >
                  {driver.isAvailable ? 'Book This Pilot' : 'Currently Unavailable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Booking Modal ── */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background border border-primary w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 md:p-8"
          >
            <div className="flex justify-between items-center mb-8 border-b border-outline-variant pb-4">
              <div>
                <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-2">
                  Reserve
                </span>
                <h2 className="font-headline-lg text-headline-lg-mobile text-primary">
                  Book {driver.name}
                </h2>
              </div>
              <button
                onClick={() => setBookingModal(false)}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BookingField
                  label="Pickup Date"
                  type="date"
                  value={bookingData.selectedDate}
                  onChange={v => setBookingData(p => ({ ...p, selectedDate: v }))}
                />
                <BookingField
                  label="Pickup Time"
                  type="time"
                  value={bookingData.selectedTime}
                  onChange={v => setBookingData(p => ({ ...p, selectedTime: v }))}
                />
              </div>

              <div>
                <label className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-2">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={bookingData.duration}
                  onChange={e => setBookingData(p => ({ ...p, duration: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 font-body-md text-body-md text-primary outline-none"
                />
              </div>

              <BookingField
                label="Pickup Location"
                type="text"
                placeholder="Enter pickup address"
                value={bookingData.pickupLocation}
                onChange={v => setBookingData(p => ({ ...p, pickupLocation: v }))}
              />
              <BookingField
                label="Drop-off Location"
                type="text"
                placeholder="Optional"
                value={bookingData.dropoffLocation}
                onChange={v => setBookingData(p => ({ ...p, dropoffLocation: v }))}
              />

              {/* Total */}
              <div className="border-t border-outline-variant pt-6">
                <div className="flex items-center justify-between">
                  <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
                    Total Amount
                  </span>
                  <span className="font-display-xl text-[40px] text-primary leading-none">
                    ${totalPrice}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-4 bg-primary text-on-primary font-ui-button text-ui-button uppercase tracking-[0.15em] hover:bg-tertiary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

/* ─── Subcomponents ─── */

const LoadingState = () => (
  <div className="min-h-screen bg-surface flex items-center justify-center">
    <div className="w-px h-12 bg-primary animate-pulse" />
  </div>
);

const ErrorState = ({ error, onBack }) => (
  <div className="min-h-screen bg-surface flex items-center justify-center px-4">
    <div className="border border-error/30 bg-error-container/20 p-8 text-center max-w-md">
      <p className="font-ui-label text-ui-label uppercase tracking-widest text-error mb-4">Error</p>
      <p className="font-body-lg text-body-lg text-primary mb-6">{error}</p>
      <button
        onClick={onBack}
        className="bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-tertiary-container transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

const NotFoundState = ({ onBack }) => (
  <div className="min-h-screen bg-surface flex items-center justify-center px-4">
    <div className="text-center">
      <p className="font-display-lg text-display-lg text-primary mb-4">Not Found</p>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">This pilot could not be located.</p>
      <button
        onClick={onBack}
        className="bg-primary text-on-primary font-ui-button text-ui-button uppercase px-8 py-4 tracking-widest hover:bg-tertiary-container transition-colors"
      >
        Back to Fleet
      </button>
    </div>
  </div>
);

const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={`material-symbols-outlined text-[16px] ${
        i < Math.floor(rating) ? 'text-primary' : 'text-outline-variant'
      }`}
    >
      star
    </span>
  ));
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-baseline border-b border-outline-variant/30 pb-2">
    <span className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant">
      {label}
    </span>
    <span className="font-body-md text-body-md text-primary text-right">{value}</span>
  </div>
);

const BookingField = ({ label, type, placeholder, value, onChange }) => (
  <div>
    <label className="font-ui-label text-ui-label uppercase tracking-widest text-on-surface-variant block mb-2">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      required={type !== 'text' || label === 'Pickup Location'}
      className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 py-2 font-body-md text-body-md text-primary placeholder-outline-variant outline-none transition-colors"
    />
  </div>
);

export default DriverDetails;
