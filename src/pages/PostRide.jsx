import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, DollarSign, Car, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ridesAPI } from '../services/api';

const PostRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    departure: {
      city: '',
      address: ''
    },
    destination: {
      city: '',
      address: ''
    },
    departureDate: '',
    departureTime: '',
    pricePerSeat: '',
    totalSeats: '4',
    description: '',
    preferences: {
      pets: false,
      music: false,
      airConditioning: false,
      smoking: false
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await ridesAPI.createRide(formData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  const PreferenceToggle = ({ name, label, icon, description }) => (
    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-medium text-gray-900">{label}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
      <input
        type="checkbox"
        name={`preferences.${name}`}
        checked={formData.preferences[name]}
        onChange={handleInputChange}
        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Post a New Ride</h1>
            <p className="text-gray-600 mt-1">Share your journey and help others travel</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Route Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Route Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Departure</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="departure.city"
                      required
                      value={formData.departure.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="departure.address"
                      required
                      value={formData.departure.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 123 Main St, Manhattan"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Destination</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="destination.city"
                      required
                      value={formData.destination.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Boston"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="destination.address"
                      required
                      value={formData.destination.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 456 Oak Ave, Downtown"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Date & Time
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    name="departureDate"
                    required
                    value={formData.departureDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    name="departureTime"
                    required
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Pricing and Seats */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                Pricing & Capacity
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Seat ($)
                  </label>
                  <input
                    type="number"
                    name="pricePerSeat"
                    required
                    min="1"
                    step="0.01"
                    value={formData.pricePerSeat}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="25.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Seats
                  </label>
                  <select
                    name="totalSeats"
                    required
                    value={formData.totalSeats}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>
                        {num} seat{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Car className="h-5 w-5 mr-2 text-blue-600" />
                Ride Preferences
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PreferenceToggle
                  name="pets"
                  label="Pets Allowed"
                  icon="🐕"
                  description="Passengers can bring pets"
                />
                <PreferenceToggle
                  name="music"
                  label="Music"
                  icon="🎵"
                  description="Music will be playing"
                />
                <PreferenceToggle
                  name="airConditioning"
                  label="Air Conditioning"
                  icon="❄️"
                  description="AC will be available"
                />
                <PreferenceToggle
                  name="smoking"
                  label="Smoking Allowed"
                  icon="🚬"
                  description="Smoking is permitted"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                Additional Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any additional details about your ride, meeting points, or special requirements..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting Ride...
                  </div>
                ) : (
                  'Post Ride'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostRide;