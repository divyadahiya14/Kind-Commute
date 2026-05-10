const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  departure: {
    city: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  destination: {
    city: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  departureDate: {
    type: Date,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  pricePerSeat: {
    type: Number,
    required: true,
    min: 0
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    maxlength: 500
  },
  preferences: {
    pets: { type: Boolean, default: false },
    music: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
    smoking: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  carInfo: {
    make: String,
    model: String,
    color: String
  }
}, {
  timestamps: true
});

// Index for search optimization
rideSchema.index({ 'departure.city': 1, 'destination.city': 1, departureDate: 1 });
rideSchema.index({ driver: 1 });

module.exports = mongoose.model('Ride', rideSchema);