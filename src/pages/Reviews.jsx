import React, { useState, useEffect } from 'react';
import { Star, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { reviewsAPI } from '../services/api';

const Reviews = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [reviews, setReviews] = useState([]);
  const [averages, setAverages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'received') {
        response = await reviewsAPI.getUserReviews(user.id);
        setAverages(response.data.averages);
      } else {
        response = await reviewsAPI.getReviewsByUser(user.id);
      }
      
      setReviews(response.data.reviews);
    } catch (error) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const StarRating = ({ rating, size = 'small' }) => {
    const starSize = size === 'small' ? 'h-4 w-4' : 'h-5 w-5';
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const CategoryRating = ({ label, rating }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <StarRating rating={rating || 0} />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-2">View feedback from your rides</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'received'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-700 hover:text-blue-600'
                }`}
              >
                Reviews Received
              </button>
              <button
                onClick={() => setActiveTab('given')}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'given'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-700 hover:text-blue-600'
                }`}
              >
                Reviews Given
              </button>
            </nav>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Average Ratings (only for received reviews) */}
            {activeTab === 'received' && averages.totalReviews > 0 && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Average Ratings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {averages.avgRating?.toFixed(1) || '0.0'}
                      </div>
                      <StarRating rating={averages.avgRating || 0} size="large" />
                      <div className="text-sm text-gray-600 mt-1">
                        Based on {averages.totalReviews} review{averages.totalReviews !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <CategoryRating label="Punctuality" rating={averages.avgPunctuality} />
                    <CategoryRating label="Friendliness" rating={averages.avgFriendliness} />
                    <CategoryRating label="Cleanliness" rating={averages.avgCleanliness} />
                    <CategoryRating label="Communication" rating={averages.avgCommunication} />
                  </div>
                </div>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'received' 
                    ? "You haven't received any reviews yet" 
                    : "You haven't given any reviews yet"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {(activeTab === 'received' ? review.reviewer : review.reviewee).profileImage ? (
                          <img
                            src={`http://localhost:5000${(activeTab === 'received' ? review.reviewer : review.reviewee).profileImage}`}
                            alt="User"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-blue-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {activeTab === 'received' 
                                ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
                                : `${review.reviewee.firstName} ${review.reviewee.lastName}`
                              }
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(review.createdAt)}</span>
                            </div>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>

                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Ride:</strong> {review.ride.departure.city} → {review.ride.destination.city}
                            <span className="ml-2">
                              ({formatDate(review.ride.departureDate)})
                            </span>
                          </div>
                        </div>

                        {review.comment && (
                          <div className="mb-4">
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        )}

                        {review.categories && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {review.categories.punctuality && (
                              <CategoryRating label="Punctuality" rating={review.categories.punctuality} />
                            )}
                            {review.categories.friendliness && (
                              <CategoryRating label="Friendliness" rating={review.categories.friendliness} />
                            )}
                            {review.categories.cleanliness && (
                              <CategoryRating label="Cleanliness" rating={review.categories.cleanliness} />
                            )}
                            {review.categories.communication && (
                              <CategoryRating label="Communication" rating={review.categories.communication} />
                            )}
                          </div>
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

export default Reviews;