import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaCar, FaCheck, FaClock, FaLanguage, FaMapMarkerAlt, FaMoneyBillWave, FaStar, FaTimes } from 'react-icons/fa';
import { endpoints } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import driverService from '../services/driverService.js';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  // Driver data state
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking modal state
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
    const fetchDriver = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('Driver ID not found');
        const data = await driverService.getDriverById(id);
        if (!data) throw new Error('Driver not found');
        setDriver(data);
      } catch (err) {
        const msg = err.message || 'Failed to load driver details';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [id]);

  // Book via API
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book a driver');
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

  // Loading
  if (loading) return <LoadingState />;
  if (error && !driver) return <ErrorState error={error} onBack={() => navigate(-1)} />;
  if (!driver) return <NotFoundState onBack={() => navigate('/pilots')} />;

  const totalPrice = (driver.hourlyRate * bookingData.duration).toFixed(2);

  return (
    <div className="min-h-screen bg-bg-base py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-3 gap-6 p-6">
            {/* Photo */}
            <div className="md:col-span-1">
              <img
                src={driver.profilePhoto || '/src/assets/images/pilots/pilot1.jpg'}
                alt={driver.name}
                className="w-full h-80 object-cover rounded-xl"
              />
            </div>

            {/* Info */}
            <div className="md:col-span-2 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h1 className="font-heading text-3xl font-bold text-text-primary">{driver.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-gold">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < Math.floor(driver.rating || 0) ? '' : 'text-text-muted/30'} />
                      ))}
                    </div>
                    <span className="text-text-secondary text-sm">
                      {driver.rating || 'N/A'} ({driver.totalRatings || 0} ratings)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DetailItem icon={<FaCar />} label="Experience" value={`${driver.experience || 0} years`} />
                  <DetailItem icon={<FaMoneyBillWave />} label="Rate" value={`₹${driver.hourlyRate || 0}/hr`} />
                </div>

                {driver.vehicleTypes?.length > 0 && (
                  <TagGroup label="Vehicle Types" items={driver.vehicleTypes} color="bg-electric/10 text-electric" />
                )}

                {driver.languages?.length > 0 && (
                  <TagGroup label="Languages" items={driver.languages} color="bg-gold/10 text-gold" />
                )}

                {driver.certifications?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {driver.certifications.map((cert, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-emerald/10 text-emerald px-2.5 py-1 rounded-lg text-xs">
                        <FaCheck className="text-[10px]" /> {cert}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    driver.isAvailable
                      ? 'bg-emerald/10 text-emerald'
                      : 'bg-rose/10 text-rose'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${driver.isAvailable ? 'bg-emerald animate-pulse' : 'bg-rose'}`} />
                    {driver.isAvailable ? 'Available Now' : 'Not Available'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => driver.isAvailable && setBookingModal(true)}
                disabled={!driver.isAvailable}
                className={`w-full mt-6 py-3.5 rounded-xl font-semibold text-lg transition-all ${
                  driver.isAvailable
                    ? 'bg-gradient-gold text-bg-base hover:shadow-glow-gold hover:scale-[1.01] active:scale-[0.99]'
                    : 'bg-bg-elevated text-text-muted cursor-not-allowed'
                }`}
              >
                {driver.isAvailable ? 'Book Now' : 'Not Available'}
              </button>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {bookingModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 shadow-card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-bold text-text-primary">Book {driver.name}</h2>
                <button onClick={() => setBookingModal(false)} className="p-2 text-text-muted hover:text-text-primary transition-colors">
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <BookingInput
                  label="Pickup Date"
                  icon={<FaCalendarAlt />}
                  type="date"
                  value={bookingData.selectedDate}
                  onChange={v => setBookingData(prev => ({ ...prev, selectedDate: v }))}
                />
                <BookingInput
                  label="Pickup Time"
                  icon={<FaClock />}
                  type="time"
                  value={bookingData.selectedTime}
                  onChange={v => setBookingData(prev => ({ ...prev, selectedTime: v }))}
                />
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Duration (hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={bookingData.duration}
                    onChange={e => setBookingData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>
                <BookingInput
                  label="Pickup Location"
                  icon={<FaMapMarkerAlt />}
                  type="text"
                  placeholder="Enter pickup location"
                  value={bookingData.pickupLocation}
                  onChange={v => setBookingData(prev => ({ ...prev, pickupLocation: v }))}
                />
                <BookingInput
                  label="Dropoff Location"
                  icon={<FaMapMarkerAlt />}
                  type="text"
                  placeholder="Optional"
                  value={bookingData.dropoffLocation}
                  onChange={v => setBookingData(prev => ({ ...prev, dropoffLocation: v }))}
                />

                <div className="bg-bg-elevated border border-border rounded-xl p-4">
                  <p className="text-sm text-text-secondary">Total Amount</p>
                  <p className="text-2xl font-bold text-gold">₹{totalPrice}</p>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-3.5 bg-gradient-gold text-bg-base font-semibold rounded-xl
                    hover:shadow-glow-gold hover:scale-[1.01] active:scale-[0.99]
                    transition-all duration-200 disabled:opacity-60"
                >
                  {bookingLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner /> Booking...
                    </span>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Subcomponents
const LoadingState = () => (
  <div className="min-h-screen bg-bg-base flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-text-secondary">Loading driver details...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onBack }) => (
  <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
    <div className="bg-rose/10 border border-rose/20 rounded-2xl p-8 text-center max-w-md">
      <h3 className="font-heading text-lg font-semibold text-rose mb-2">Error Loading Driver</h3>
      <p className="text-rose/80 mb-6">{error}</p>
      <button onClick={onBack} className="px-6 py-2 bg-rose/20 text-rose rounded-xl hover:bg-rose/30 transition-colors">
        Go Back
      </button>
    </div>
  </div>
);

const NotFoundState = ({ onBack }) => (
  <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
    <div className="text-center">
      <p className="text-text-secondary mb-4">Driver not found</p>
      <button onClick={onBack} className="px-6 py-2 bg-gradient-gold text-bg-base rounded-xl font-medium">
        Back to Drivers
      </button>
    </div>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-bg-elevated rounded-xl px-4 py-3">
    <span className="text-gold">{icon}</span>
    <div>
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-sm font-semibold text-text-primary">{value}</p>
    </div>
  </div>
);

const TagGroup = ({ label, items, color }) => (
  <div>
    <p className="text-sm text-text-secondary mb-1.5">{label}</p>
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className={`px-2.5 py-1 rounded-lg text-sm ${color}`}>{item}</span>
      ))}
    </div>
  </div>
);

const BookingInput = ({ label, icon, type, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm text-text-secondary mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        className="w-full bg-bg-elevated border border-border rounded-xl pl-12 pr-4 py-3
          text-text-primary placeholder:text-text-muted
          focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-colors"
      />
    </div>
  </div>
);

const Spinner = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default DriverDetails;
