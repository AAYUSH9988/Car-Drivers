import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { endpoints } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { FaCar, FaCalendar, FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaStar, FaUser, FaCheck, FaTimes } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await endpoints.bookings.getAll();
      setBookings(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const upcoming = filteredBookings.filter(b => ['pending', 'confirmed'].includes(b.status));
  const past = filteredBookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  return (
    <div className="min-h-screen bg-bg-base py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-text-primary">My Dashboard</h1>
            <p className="text-text-secondary mt-1">Welcome back, {user?.name || 'Guest'}</p>
          </div>
          <Link
            to="/pilots"
            className="px-6 py-2.5 bg-gradient-gold text-bg-base font-semibold rounded-xl
              hover:shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all text-center w-fit"
          >
            Book a Driver
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value={bookings.length} label="Total Bookings" icon={<FaCalendar />} />
          <StatCard value={upcoming.length} label="Upcoming" icon={<FaClock />} color="text-gold" />
          <StatCard value={past.filter(b => b.status === 'completed').length} label="Completed" icon={<FaCheck />} color="text-emerald" />
          <StatCard value={`₹${bookings.reduce((a, b) => a + (b.totalAmount || 0), 0)}`} label="Total Spent" icon={<FaMoneyBillWave />} color="text-electric" />
        </div>

        {/* Bookings Section */}
        <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <Tab label="Upcoming" active={filter === 'upcoming'} onClick={() => setFilter('upcoming')} count={upcoming.length} />
            <Tab label="Past" active={filter === 'past'} onClick={() => setFilter('past')} count={past.length} />
            <Tab label="All" active={filter === 'all'} onClick={() => setFilter('all')} count={bookings.length} />
          </div>

          {/* List */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <EmptyState onBook={() => window.location.href = '/pilots'} />
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Tab = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`px-6 py-4 text-sm font-medium transition-colors relative ${
      active ? 'text-gold' : 'text-text-secondary hover:text-text-primary'
    }`}
  >
    {label} {count > 0 && <span className="ml-1.5 text-xs bg-bg-elevated px-2 py-0.5 rounded-full">{count}</span>}
    {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
  </button>
);

const StatCard = ({ value, label, icon, color = 'text-gold' }) => (
  <div className="bg-bg-surface border border-border rounded-2xl p-5">
    <div className={`${color} mb-2`}>{icon}</div>
    <div className="text-2xl font-bold text-text-primary">{value}</div>
    <div className="text-sm text-text-secondary">{label}</div>
  </div>
);

const BookingCard = ({ booking }) => {
  const statusColors = {
    pending: 'bg-gold/10 text-gold',
    confirmed: 'bg-emerald/10 text-emerald',
    completed: 'bg-electric/10 text-electric',
    cancelled: 'bg-rose/10 text-rose'
  };

  return (
    <div className="border border-border rounded-xl p-5 hover:border-gold/30 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-bg-elevated rounded-full flex items-center justify-center">
              <FaCar className="text-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">{booking.driver?.name || 'Unknown Driver'}</h3>
              <p className="text-sm text-text-secondary">Ref: {booking.bookingReference || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-sm">
            <InfoItem icon={<FaCalendar />} label="Date" value={new Date(booking.startTime).toLocaleDateString()} />
            <InfoItem icon={<FaClock />} label="Time" value={new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            <InfoItem icon={<FaMapMarkerAlt />} label="Pickup" value={booking.pickupLocation} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-text-muted/10 text-text-muted'}`}>
            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
          </span>
          <span className="font-bold text-text-primary">₹{booking.totalAmount}</span>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-text-secondary">
    <span className="text-xs">{icon}</span>
    <div>
      <span className="text-xs block">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  </div>
);

const EmptyState = ({ onBook }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center mx-auto mb-4">
      <FaCalendar className="text-text-muted text-2xl" />
    </div>
    <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">No bookings yet</h3>
    <p className="text-text-secondary mb-6">Start your first journey with GoPilot</p>
    <button onClick={onBook} className="px-6 py-2.5 bg-gradient-gold text-bg-base font-semibold rounded-xl hover:shadow-glow-gold transition-all">
      Book a Driver
    </button>
  </div>
);

export default Dashboard;
