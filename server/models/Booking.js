const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seatsBooked: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  passengerNotes: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Prevent duplicate bookings
bookingSchema.index({ ride: 1, passenger: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);