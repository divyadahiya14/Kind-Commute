import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, MapPin, Users, Plus, Clock, Star, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ridesAPI, bookingsAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    upcomingRides: [],
    recentBookings: [],
    stats: {
      totalRides: 0,
      totalBookings: 0,
      upcomingTrips: 0,
      rating: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const promises = [];

        // Driver data
        if (user.role === 'driver' || user.role === 'both') {
          promises.push(ridesAPI.getMyRides({ status: 'active', limit: 5 }));
        }

        // Passenger data
        if (user.role === 'passenger' || user.role === 'both') {
          promises.push(bookingsAPI.getMyBookings({ status: 'confirmed', limit: 5 }));
        }

        const results = await Promise.all(promises);
        
        let upcomingRides = [];
        let recentBookings = [];

        if (user.role === 'driver' || user.role === 'both') {
          upcomingRides = results[0]?.data.rides || [];
        }

        if (user.role === 'passenger' || user.role === 'both') {
          const bookingIndex = (user.role === 'both') ? 1 : 0;
          recentBookings = results[bookingIndex]?.data.bookings || [];
        }

        setData({
          upcomingRides,
          recentBookings,
          stats: {
            totalRides: upcomingRides.length,
            totalBookings: recentBookings.length,
            upcomingTrips: upcomingRides.length + recentBookings.length,
            rating: user.rating || 0
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your rides and bookings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Trips</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.upcomingTrips}</p>
              </div>
            </div>
          </div>

          {(user.role === 'driver' || user.role === 'both') && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Rides</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.totalRides}</p>
                </div>
              </div>
            </div>
          )}

          {(user.role === 'passenger' || user.role === 'both') && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.totalBookings}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Your Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.stats.rating.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/search"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MapPin className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Find a Ride</h3>
                  <p className="text-sm text-gray-600">Search for available rides</p>
                </div>
              </Link>

              {(user.role === 'driver' || user.role === 'both') && (
                <Link
                  to="/post-ride"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Post a Ride</h3>
                    <p className="text-sm text-gray-600">Share your journey</p>
                  </div>
                </Link>
              )}

              <Link
                to="/profile"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Edit Profile</h3>
                  <p className="text-sm text-gray-600">Update your information</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {(user.role === 'driver' || user.role === 'both') && (
                <button
                  onClick={() => setActiveTab('rides')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'rides'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-700 hover:text-blue-600'
                  }`}
                >
                  My Rides
                </button>
              )}

              {(user.role === 'passenger' || user.role === 'both') && (
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'bookings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-700 hover:text-blue-600'
                  }`}
                >
                  My Bookings
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* Rides Tab */}
            {activeTab === 'rides' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Your Upcoming Rides</h3>
                  <Link
                    to="/post-ride"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Post New Ride
                  </Link>
                </div>

                {data.upcomingRides.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming rides</h3>
                    <p className="text-gray-600 mb-4">Start sharing your journey with others</p>
                    <Link
                      to="/post-ride"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Post Your First Ride
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.upcomingRides.map((ride) => (
                      <div key={ride._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(ride.departureDate)}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTime(ride.departureTime)}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {ride.departure.city} → {ride.destination.city}
                              </span>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>${ride.pricePerSeat}/seat</span>
                              <span>{ride.availableSeats}/{ride.totalSeats} seats available</span>
                              <span>{ride.seatsBooked || 0} booked</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Link
                              to={`/ride/${ride._id}`}
                              className="text-blue-600 hover:text-blue-700 p-2"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Your Bookings</h3>
                  <Link
                    to="/search"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Find More Rides
                  </Link>
                </div>

                {data.recentBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-4">Find and book your first ride</p>
                    <Link
                      to="/search"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Search Rides
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.recentBookings.map((booking) => (
                      <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
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
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {booking.ride.departure.city} → {booking.ride.destination.city}
                              </span>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Driver: {booking.ride.driver.firstName} {booking.ride.driver.lastName}</span>
                              <span>{booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}</span>
                              <span>${booking.totalPrice}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Link
                              to={`/ride/${booking.ride._id}`}
                              className="text-blue-600 hover:text-blue-700 p-2"
                              title="View ride details"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;