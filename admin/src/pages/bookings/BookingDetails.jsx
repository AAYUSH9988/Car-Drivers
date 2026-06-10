import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, DollarSign, User, Car } from 'lucide-react';
import { bookingAPI } from '../../services/api';
import { toast } from 'sonner';
import Breadcrumb from '../../components/layout/Breadcrumb';

const STATUS_MAP = {
  pending:      { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10'   },
  confirmed:    { dot: 'bg-violet-400',  text: 'text-violet-400',  bg: 'bg-violet-400/10'  },
  'in-progress':{ dot: 'bg-sky-400',     text: 'text-sky-400',     bg: 'bg-sky-400/10'     },
  completed:    { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  cancelled:    { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-400/10'     },
};

const VALID_TRANSITIONS = {
  pending:      ['confirmed', 'cancelled'],
  confirmed:    ['in-progress', 'cancelled'],
  'in-progress':['completed', 'cancelled'],
  completed:    [],
  cancelled:    [],
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { dot: 'bg-slate-400', text: 'text-slate-400', bg: 'bg-slate-400/10' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-admin-border last:border-0">
    <span className="text-sm text-admin-text-3">{label}</span>
    <span className="text-sm text-admin-text-1 font-medium text-right ml-4">{value || '—'}</span>
  </div>
);

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let mounted = true;
    bookingAPI.getById(id)
      .then(res => { if (mounted) setBooking(res.data.data); })
      .catch(() => { toast.error('Failed to load booking'); navigate('/bookings'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await bookingAPI.updateStatus(id, newStatus);
      setBooking(b => ({ ...b, status: newStatus }));
      toast.success(`Booking updated to ${newStatus}`);
    } catch {
      toast.error('Status update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-admin-elevated rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-admin-surface border border-admin-border rounded-md h-80" />
          <div className="bg-admin-surface border border-admin-border rounded-md h-80" />
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const duration = booking.startTime && booking.endTime
    ? Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60) * 10) / 10
    : null;

  const nextStatuses = VALID_TRANSITIONS[booking.status] || [];

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/bookings')} className="p-2 text-admin-text-3 hover:text-admin-text-1 hover:bg-admin-elevated rounded-md transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-admin-text-1 font-mono">
              {booking.bookingReference || booking._id?.slice(0, 12).toUpperCase()}
            </h1>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-sm text-admin-text-3 mt-0.5">
            Created {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '—'}
          </p>
        </div>
        {nextStatuses.length > 0 && (
          <div className="flex items-center gap-2">
            {nextStatuses.map(s => (
              <button
                key={s}
                disabled={updating}
                onClick={() => handleStatusUpdate(s)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 capitalize ${
                  s === 'cancelled'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                    : 'bg-admin-accent hover:bg-admin-accent-dim text-white'
                }`}
              >
                Mark {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trip Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-admin-surface border border-admin-border rounded-md p-6">
            <h2 className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest mb-4">Trip Details</h2>
            <InfoRow label="Pickup Location" value={booking.pickupLocation} />
            <InfoRow label="Drop-off Location" value={booking.dropLocation || booking.dropoffLocation} />
            <InfoRow
              label="Start Time"
              value={booking.startTime ? new Date(booking.startTime).toLocaleString() : null}
            />
            <InfoRow
              label="End Time"
              value={booking.endTime ? new Date(booking.endTime).toLocaleString() : null}
            />
            {duration && <InfoRow label="Duration" value={`${duration} hours`} />}
            <InfoRow label="Notes" value={booking.notes} />
          </div>

          <div className="bg-admin-surface border border-admin-border rounded-md p-6">
            <h2 className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest mb-4">Payment</h2>
            <InfoRow label="Total Amount" value={`₹${booking.totalAmount?.toFixed(2) || '0.00'}`} />
            <InfoRow label="Platform Fee" value={booking.platformFee != null ? `₹${booking.platformFee.toFixed(2)}` : null} />
            <InfoRow label="Driver Earning" value={booking.driverEarning != null ? `₹${booking.driverEarning.toFixed(2)}` : null} />
            <InfoRow label="Payment Method" value={booking.paymentMethod} />
            <InfoRow label="Payment Status" value={booking.paymentStatus?.toUpperCase()} />
          </div>

          {booking.review && (
            <div className="bg-admin-surface border border-admin-border rounded-md p-6">
              <h2 className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest mb-3">Review</h2>
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-base ${i < booking.review.rating ? 'text-amber-400' : 'text-admin-elevated'}`}>★</span>
                ))}
                <span className="text-sm font-semibold text-admin-text-1">{booking.review.rating}/5</span>
              </div>
              {booking.review.comment && (
                <p className="text-sm text-admin-text-2 italic">"{booking.review.comment}"</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: User + Driver */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-admin-surface border border-admin-border rounded-md p-5">
            <div className="flex items-center gap-2 mb-4">
              <User size={14} className="text-admin-text-3" />
              <span className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest">Customer</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-semibold text-blue-400">
                {booking.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-admin-text-1">{booking.user?.name || '—'}</p>
                <p className="text-xs text-admin-text-3">{booking.user?.email}</p>
              </div>
            </div>
            {booking.user?.phone && (
              <a href={`tel:${booking.user.phone}`} className="text-xs text-admin-accent hover:underline">{booking.user.phone}</a>
            )}
            {booking.user?._id && (
              <button
                onClick={() => navigate(`/users/${booking.user._id}`)}
                className="mt-3 w-full text-center text-xs text-admin-accent hover:text-admin-accent-dim transition-colors"
              >
                View profile →
              </button>
            )}
          </div>

          {/* Driver */}
          <div className="bg-admin-surface border border-admin-border rounded-md p-5">
            <div className="flex items-center gap-2 mb-4">
              <Car size={14} className="text-admin-text-3" />
              <span className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest">Driver</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-semibold text-emerald-400">
                {booking.driver?.user?.name?.charAt(0).toUpperCase() || 'D'}
              </div>
              <div>
                <p className="text-sm font-medium text-admin-text-1">{booking.driver?.user?.name || '—'}</p>
                <p className="text-xs text-admin-text-3">{booking.driver?.user?.phone || '—'}</p>
              </div>
            </div>
            <InfoRow label="License" value={booking.driver?.licenseNumber} />
            <InfoRow label="Rate" value={booking.driver?.hourlyRate ? `₹${booking.driver.hourlyRate}/hr` : null} />
            {booking.driver?._id && (
              <button
                onClick={() => navigate(`/drivers/${booking.driver._id}`)}
                className="mt-3 w-full text-center text-xs text-admin-accent hover:text-admin-accent-dim transition-colors"
              >
                View profile →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
