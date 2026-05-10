import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, DollarSign, Car, Star, Phone, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ridesAPI, bookingsAPI } from '../services/api';

const RideDetails = () => {
  const { rideId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [passengerNotes, setPassengerNotes] = useState('');

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await ridesAPI.getRideById(rideId);
        setRide(response.data.ride);
      } catch (error) {
        setError('Failed to load ride details');
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [rideId]);

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      await bookingsAPI.createBooking({
        rideId: ride._id,
        seatsBooked: seatsToBook,
        passengerNotes
      });
      
      // Update ride data
      setRide(prev => ({
        ...prev,
        availableSeats: prev.availableSeats - seatsToBook
      }));

      alert('Booking successful! Check your dashboard for details.');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to book ride');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const PreferenceIcon = ({ type, enabled }) => {
    const icons = {
      pets: '🐕',
      music: '🎵',
      airConditioning: '❄️',
      smoking: '🚭'
    };
    
    const labels = {
      pets: 'Pets allowed',
      music: 'Music',
      airConditioning: 'Air conditioning',
      smoking: 'No smoking'
    };
    
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
        enabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
      }`}>
        <span className="text-lg">{icons[type]}</span>
        <span className="text-sm font-medium">{labels[type]}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ride Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const isDriver = user && user.id === ride.driver._id;
  const canBook = user && !isDriver && ride.availableSeats >= seatsToBook;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {ride.departure.city} → {ride.destination.city}
                </h1>
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(ride.departureDate)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(ride.departureTime)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">${ride.pricePerSeat}</div>
                <div className="text-blue-100">per seat</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Route Details */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Route Details</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-gray-900">{ride.departure.city}</div>
                        <div className="text-sm text-gray-600">{ride.departure.address}</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-gray-900">{ride.destination.city}</div>
                        <div className="text-sm text-gray-600">{ride.destination.address}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Driver</h2>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      {ride.driver.profileImage ? (
                        <img
                          src={`http://localhost:5000${ride.driver.profileImage}`}
                          alt="Driver"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {ride.driver.firstName} {ride.driver.lastName}
                      </h3>
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {ride.driver.rating ? ride.driver.rating.toFixed(1) : '0.0'} 
                          ({ride.driver.totalReviews || 0} reviews)
                        </span>
                      </div>
                      {ride.driver.bio && (
                        <p className="text-sm text-gray-600">{ride.driver.bio}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Car Information */}
                {ride.carInfo && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle</h2>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Car className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {ride.carInfo.make} {ride.carInfo.model}
                          {ride.carInfo.color && ` (${ride.carInfo.color})`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Ride Preferences</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <PreferenceIcon type="pets" enabled={ride.preferences?.pets} />
                    <PreferenceIcon type="music" enabled={ride.preferences?.music} />
                    <PreferenceIcon type="airConditioning" enabled={ride.preferences?.airConditioning} />
                    <PreferenceIcon type="smoking" enabled={!ride.preferences?.smoking} />
                  </div>
                </div>

                {/* Description */}
                {ride.description && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{ride.description}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      ${ride.pricePerSeat}
                    </div>
                    <div className="text-sm text-gray-600">per seat</div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Available seats:</span>
                      <span className="font-medium text-gray-900">{ride.availableSeats}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total seats:</span>
                      <span className="font-medium text-gray-900">{ride.totalSeats}</span>
                    </div>
                  </div>

                  {!isDriver && user && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of seats
                        </label>
                        <select
                          value={seatsToBook}
                          onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Array.from({ length: Math.min(ride.availableSeats, 8) }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>
                              {num} seat{num > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message to driver (optional)
                        </label>
                        <textarea
                          value={passengerNotes}
                          onChange={(e) => setPassengerNotes(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Any special requests or information..."
                        />
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium text-gray-900">Total:</span>
                          <span className="text-xl font-bold text-gray-900">
                            ${(ride.pricePerSeat * seatsToBook).toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={handleBooking}
                          disabled={bookingLoading || !canBook || ride.availableSeats === 0}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                            canBook && ride.availableSeats > 0
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {bookingLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Booking...
                            </div>
                          ) : ride.availableSeats === 0 ? (
                            'Fully Booked'
                          ) : (
                            'Book Now'
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {!user && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Sign in to book this ride
                      </p>
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                      >
                        Sign In
                      </button>
                    </div>
                  )}

                  {isDriver && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        This is your ride
                      </p>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                      >
                        Manage Ride
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideDetails;