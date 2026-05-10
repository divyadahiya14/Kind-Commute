import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Clock, Car, Star, Filter } from 'lucide-react';
import { ridesAPI } from '../services/api';

const SearchRides = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchData, setSearchData] = useState({
    departure: searchParams.get('departure') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || '',
    seats: searchParams.get('seats') || '1'
  });
  const [filters, setFilters] = useState({
    maxPrice: '',
    preferences: {
      pets: false,
      music: false,
      airConditioning: false,
      smoking: false
    }
  });
  const [showFilters, setShowFilters] = useState(false);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    searchRides();
  }, [searchParams]);

  const searchRides = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        departure: searchData.departure,
        destination: searchData.destination,
        date: searchData.date,
        seats: searchData.seats,
        page
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await ridesAPI.searchRides(params);
      setRides(response.data.rides);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error searching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    Object.keys(searchData).forEach(key => {
      if (searchData[key]) {
        params.append(key, searchData[key]);
      }
    });

    setSearchParams(params);
  };

  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
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

  const PreferenceIcon = ({ type, enabled }) => {
    const icons = {
      pets: '🐕',
      music: '🎵',
      airConditioning: '❄️',
      smoking: '🚭'
    };
    
    return (
      <span className={`text-sm ${enabled ? 'opacity-100' : 'opacity-30'}`}>
        {icons[type]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Your Perfect Ride</h1>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="departure"
                  placeholder="From where?"
                  value={searchData.departure}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="destination"
                  placeholder="To where?"
                  value={searchData.destination}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={searchData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  name="seats"
                  value={searchData.seats}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>
                      {num} seat{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>{loading ? 'Searching...' : 'Search'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Price per Seat
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 50"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferences
                    </label>
                    <div className="flex space-x-4">
                      {Object.keys(filters.preferences).map((pref) => (
                        <label key={pref} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.preferences[pref]}
                            onChange={(e) => setFilters({
                              ...filters,
                              preferences: {
                                ...filters.preferences,
                                [pref]: e.target.checked
                              }
                            })}
                            className="mr-2"
                          />
                          <PreferenceIcon type={pref} enabled={true} />
                          <span className="text-sm text-gray-700 ml-1 capitalize">
                            {pref.replace(/([A-Z])/g, ' $1')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {pagination.total > 0 ? (
                `${pagination.total} ride${pagination.total > 1 ? 's' : ''} found`
              ) : (
                'No rides found'
              )}
            </h2>
            
            {pagination.total > 0 && (
              <p className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Rides List */}
          {!loading && rides.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or check back later for new rides.
              </p>
              <Link
                to="/post-ride"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Post a Ride Instead
              </Link>
            </div>
          )}

          {!loading && rides.map((ride) => (
            <div key={ride._id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {ride.driver.profileImage ? (
                        <img
                          src={`http://localhost:5000${ride.driver.profileImage}`}
                          alt="Driver"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold">
                          {ride.driver.firstName[0]}{ride.driver.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {ride.driver.firstName} {ride.driver.lastName}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {ride.driver.rating ? ride.driver.rating.toFixed(1) : '0.0'} 
                          ({ride.driver.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${ride.pricePerSeat}
                    </div>
                    <div className="text-sm text-gray-600">per seat</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{ride.departure.city}</div>
                      <div className="text-sm text-gray-600">{ride.departure.address}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-px bg-gray-300 w-12 mx-auto mb-1"></div>
                      <Car className="h-4 w-4 text-gray-400 mx-auto" />
                      <div className="h-px bg-gray-300 w-12 mx-auto mt-1"></div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{ride.destination.city}</div>
                      <div className="text-sm text-gray-600">{ride.destination.address}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(ride.departureDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(ride.departureTime)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{ride.availableSeats} seats left</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <PreferenceIcon type="pets" enabled={ride.preferences?.pets} />
                    <PreferenceIcon type="music" enabled={ride.preferences?.music} />
                    <PreferenceIcon type="airConditioning" enabled={ride.preferences?.airConditioning} />
                    <PreferenceIcon type="smoking" enabled={!ride.preferences?.smoking} />
                  </div>
                </div>

                {ride.carInfo && (
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Vehicle:</span> {ride.carInfo.make} {ride.carInfo.model} 
                    {ride.carInfo.color && ` (${ride.carInfo.color})`}
                  </div>
                )}

                {ride.description && (
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Notes:</span> {ride.description}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Total for {searchData.seats} seat{searchData.seats > 1 ? 's' : ''}: 
                    <span className="font-semibold text-gray-900 ml-1">
                      ${ride.pricePerSeat * parseInt(searchData.seats)}
                    </span>
                  </div>

                  <Link
                    to={`/ride/${ride._id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => searchRides(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    page === pagination.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchRides;