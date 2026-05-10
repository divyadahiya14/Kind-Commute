import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfileImage: (formData) => api.post('/users/profile/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCarInfo: (data) => api.put('/users/car-info', data),
  getUserById: (userId) => api.get(`/users/${userId}`),
};

// Rides API
export const ridesAPI = {
  createRide: (data) => api.post('/rides', data),
  searchRides: (params) => api.get('/rides/search', { params }),
  getRideById: (rideId) => api.get(`/rides/${rideId}`),
  getMyRides: (params) => api.get('/rides/driver/my-rides', { params }),
  updateRide: (rideId, data) => api.put(`/rides/${rideId}`, data),
  cancelRide: (rideId) => api.delete(`/rides/${rideId}`),
};

// Bookings API
export const bookingsAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/passenger/my-bookings', { params }),
  getRideBookings: (params) => api.get('/bookings/driver/ride-bookings', { params }),
  cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`),
  updateBookingStatus: (bookingId, status) => api.put(`/bookings/${bookingId}/status`, { status }),
};

// Reviews API
export const reviewsAPI = {
  createReview: (data) => api.post('/reviews', data),
  getUserReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
  getReviewsByUser: (userId, params) => api.get(`/reviews/by-user/${userId}`, { params }),
};

export default api;