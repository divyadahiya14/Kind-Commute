import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Star, Eye, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingsAPI } from '../services/api';
import { Link } from 'react-router-dom';

const Bookings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('passenger');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'passenger') {
        response = await bookingsAPI.getMyBookings();
      } else {
        response = await bookingsAPI.getRideBookings();
      }
      
      setBookings(response.data.bookings);
    } catch (error) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingsAPI.cancelBooking(bookingId);
      fetchBookings(); // Refresh the list
    } catch (error) {
      setError('Failed to cancel booking');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">Manage your ride bookings and reservations</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {(user.role === 'passenger' || user.role === 'both') && (
                <button
                  onClick={() => setActiveTab('passenger')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'passenger'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-700 hover:text-blue-600'
                  }`}
                >
                  As Passenger
                </button>
              )}

              {(user.role === 'driver' || user.role === 'both') && (
                <button
                  onClick={() => setActiveTab('driver')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'driver'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-700 hover:text-blue-600'
                  }`}
                >
                  My Ride Bookings
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'passenger' 
                    ? "You haven't booked any rides yet" 
                    : "No one has booked your rides yet"
                  }
                </p>
                <Link
                  to={activeTab === 'passenger' ? '/search' : '/post-ride'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {activeTab === 'passenger' ? 'Find Rides' : 'Post a Ride'}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(booking.ride.departureDate)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(booking.ride.departureTime)}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {booking.ride.departure.city} → {booking.ride.destination.city}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {activeTab === 'passenger' ? (
                                booking.ride.driver.profileImage ? (
                                  <img
                                    src={`http://localhost:5000${booking.ride.driver.profileImage}`}
                                    alt="Driver"
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="h-5 w-5 text-blue-600" />
                                )
                              ) : (
                                booking.passenger.profileImage ? (
                                  <img
                                    src={`http://localhost:5000${booking.passenger.profileImage}`}
                                    alt="Passenger"
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="h-5 w-5 text-blue-600" />
                                )
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {activeTab === 'passenger' 
                                  ? `${booking.ride.driver.firstName} ${booking.ride.driver.lastName}`
                                  : `${booking.passenger.firstName} ${booking.passenger.lastName}`
                                }
                              </div>
                              <div className="text-sm text-gray-600">
                                {activeTab === 'passenger' ? 'Driver' : 'Passenger'}
                              </div>
                            </div>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Seats: {booking.seatsBooked}</div>
                            <div>Total: ${booking.totalPrice}</div>
                            <div>Booked: {formatDate(booking.bookingDate)}</div>
                          </div>
                        </div>

                        {booking.passengerNotes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {activeTab === 'passenger' ? 'Your note:' : 'Passenger note:'}
                            </div>
                            <div className="text-sm text-gray-600">{booking.passengerNotes}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Link
                          to={`/ride/${booking.ride._id}`}
                          className="text-blue-600 hover:text-blue-700 p-2"
                          title="View ride details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="text-red-600 hover:text-red-700 p-2"
                            title="Cancel booking"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;