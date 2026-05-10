const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create booking (passengers only)
router.post('/', auth, requireRole(['passenger']), [
  body('rideId').isMongoId(),
  body('seatsBooked').isInt({ min: 1, max: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, seatsBooked, passengerNotes } = req.body;

    // 1. Initial checks (read-only)
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'active') {
      return res.status(400).json({ message: 'Ride is not available for booking' });
    }

    // Check if user is the driver
    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot book your own ride' });
    }

    // Check if user already has a booking for this ride
    const existingBooking = await Booking.findOne({
      ride: rideId,
      passenger: req.user._id
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this ride' });
    }

    // 2. The Solution (Atomic Operation)
    // Find the active ride, check if seats are STILL available, and decrement in one database operation
    const updatedRide = await Ride.findOneAndUpdate(
      {
        _id: rideId,
        status: 'active',
        availableSeats: { $gte: seatsBooked }
      },
      {
        $inc: { availableSeats: -seatsBooked }
      },
      { new: true } // Returns the updated document
    );

    if (!updatedRide) {
      // Since it passed the earlier read checks, a failure here explicitly means a race condition occurred!
      return res.status(400).json({
        message: 'Oops! Another user just booked those seats. Not enough seats remaining.'
      });
    }

    // 3. Create booking safely now that we successfully claimed the seats
    const booking = new Booking({
      ride: rideId,
      passenger: req.user._id,
      seatsBooked,
      totalPrice: updatedRide.pricePerSeat * seatsBooked,
      passengerNotes
    });

    try {
      await booking.save();
    } catch (saveError) {
      // If the booking save fails for any reason (e.g. database hiccup), 
      // rollback the seats we just took atomically so the ride becomes available again
      await Ride.updateOne({ _id: rideId }, { $inc: { availableSeats: seatsBooked } });
      throw saveError; // Pass error down to the global catch block
    }

    await booking.populate([
      { path: 'ride', populate: { path: 'driver', select: 'firstName lastName' } },
      { path: 'passenger', select: 'firstName lastName profileImage' }
    ]);

    res.status(201).json({
      booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error during booking creation' });
  }
});

// Get user's bookings (as passenger)
router.get('/passenger/my-bookings', auth, requireRole(['passenger']), async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;

    let query = { passenger: req.user._id };
    if (status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'ride',
        populate: { path: 'driver', select: 'firstName lastName profileImage rating' }
      })
      .populate('passenger', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get passenger bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bookings for driver's rides
router.get('/driver/ride-bookings', auth, requireRole(['driver']), async (req, res) => {
  try {
    const { rideId, page = 1, limit = 10 } = req.query;

    let rideQuery = { driver: req.user._id };
    if (rideId) {
      rideQuery._id = rideId;
    }

    const rides = await Ride.find(rideQuery).select('_id');
    const rideIds = rides.map(ride => ride._id);

    const bookings = await Booking.find({ ride: { $in: rideIds } })
      .populate({
        path: 'ride',
        select: 'departure destination departureDate departureTime'
      })
      .populate('passenger', 'firstName lastName profileImage phone rating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments({ ride: { $in: rideIds } });

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get driver bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.put('/:bookingId/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the passenger or the driver of the ride
    const ride = await Ride.findById(booking.ride);
    const isPassenger = booking.passenger.toString() === req.user._id.toString();
    const isDriver = ride.driver.toString() === req.user._id.toString();

    if (!isPassenger && !isDriver) {
      return res.status(403).json({ message: 'Unauthorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Restore available seats
    ride.availableSeats += booking.seatsBooked;
    await ride.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error during booking cancellation' });
  }
});

// Update booking status (for drivers)
router.put('/:bookingId/status', auth, requireRole(['driver']), [
  body('status').isIn(['confirmed', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const booking = await Booking.findById(req.params.bookingId).populate('ride');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the driver of the ride
    if (booking.ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    res.json({
      booking,
      message: `Booking ${status} successfully`
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error during booking status update' });
  }
});

module.exports = router;