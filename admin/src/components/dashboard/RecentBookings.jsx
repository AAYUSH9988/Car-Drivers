import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const RecentBookings = ({ bookings = [] }) => {
  // If no bookings, show placeholder data
  const placeholderBookings = [
    {
      _id: '1',
      startTime: new Date(2023, 5, 15, 10, 0),
      endTime: new Date(2023, 5, 15, 14, 0),
      user: { name: 'John Doe' },
      driver: { user: { name: 'Mike Smith' } },
      pickupLocation: '123 Main St, City',
      status: 'completed',
      totalAmount: 75.00
    },
    {
      _id: '2',
      startTime: new Date(2023, 5, 16, 9, 0),
      endTime: new Date(2023, 5, 16, 12, 0),
      user: { name: 'Jane Williams' },
      driver: { user: { name: 'David Johnson' } },
      pickupLocation: '456 Park Ave, Town',
      status: 'confirmed',
      totalAmount: 60.00
    },
    {
      _id: '3',
      startTime: new Date(2023, 5, 17, 13, 0),
      endTime: new Date(2023, 5, 17, 15, 30),
      user: { name: 'Robert Brown' },
      driver: { user: { name: 'Sarah Davis' } },
      pickupLocation: '789 Oak St, Village',
      status: 'pending',
      totalAmount: 45.00
    }
  ];

  const displayBookings = bookings.length > 0 ? bookings : placeholderBookings;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Booking ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Driver
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayBookings.map((booking) => (
            <tr key={booking._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                <Link to={`/bookings/${booking._id}`}>
                  #{booking._id.substring(0, 8)}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{booking.driver.user.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{format(new Date(booking.startTime), 'MMM dd, yyyy')}</div>
                <div className="text-sm text-gray-500">{format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹{(booking.totalAmount || 0).toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentBookings;