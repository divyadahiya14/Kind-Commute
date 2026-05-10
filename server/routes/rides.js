const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create a new ride (drivers only)
router.post('/', auth, requireRole(['driver']), [
  body('departure.city').trim().isLength({ min: 1 }),
  body('departure.address').trim().isLength({ min: 1 }),
  body('destination.city').trim().isLength({ min: 1 }),
  body('destination.address').trim().isLength({ min: 1 }),
  body('departureDate').isISO8601(),
  body('departureTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('pricePerSeat').isFloat({ min: 0 }),
  body('totalSeats').isInt({ min: 1, max: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const rideData = {
      ...req.body,
      driver: req.user._id,
      availableSeats: req.body.totalSeats,
      carInfo: req.user.carInfo
    };

    const ride = new Ride(rideData);
    await ride.save();

    await ride.populate('driver', 'firstName lastName profileImage rating totalReviews');

    res.status(201).json({ 
      ride,
      message: 'Ride created successfully' 
    });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ message: 'Server error during ride creation' });
  }
});

// Search rides
router.get('/search', [
  query('departure').optional().trim(),
  query('destination').optional().trim(),
  query('date').optional().isISO8601(),
  query('seats').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { departure, destination, date, seats = 1, page = 1, limit = 10 } = req.query;

    let searchQuery = { 
      status: 'active',
      availableSeats: { $gte: parseInt(seats) }
    };

    // Add location filters if provided
    if (departure) {
      searchQuery['departure.city'] = new RegExp(departure, 'i');
    }
    
    if (destination) {
      searchQuery['destination.city'] = new RegExp(destination, 'i');
    }

    // Add date filter if provided
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      searchQuery.departureDate = {
        $gte: searchDate,
        $lt: nextDay
      };
    } else {
      // Only show future rides
      searchQuery.departureDate = { $gte: new Date() };
    }

    const rides = await Ride.find(searchQuery)
      .populate('driver', 'firstName lastName profileImage rating totalReviews')
      .sort({ departureDate: 1, departureTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ride.countDocuments(searchQuery);

    res.json({
      rides,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Search rides error:', error);
    res.status(500).json({ message: 'Server error during ride search' });
  }
});

// Get ride by ID
router.get('/:rideId', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate('driver', 'firstName lastName profileImage rating totalReviews phone carInfo preferences');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json({ ride });
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's rides (as driver)
router.get('/driver/my-rides', auth, requireRole(['driver']), async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;

    let query = { driver: req.user._id };
    if (status !== 'all') {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .populate('driver', 'firstName lastName profileImage')
      .sort({ departureDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get booking count for each ride
    const ridesWithBookings = await Promise.all(
      rides.map(async (ride) => {
        const bookingCount = await Booking.countDocuments({ 
          ride: ride._id, 
          status: { $in: ['confirmed', 'completed'] } 
        });
        return {
          ...ride.toObject(),
          bookingCount,
          seatsBooked: ride.totalSeats - ride.availableSeats
        };
      })
    );

    const total = await Ride.countDocuments(query);

    res.json({
      rides: ridesWithBookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get driver rides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ride
router.put('/:rideId', auth, requireRole(['driver']), async (req, res) => {
  try {
    const ride = await Ride.findOne({ _id: req.params.rideId, driver: req.user._id });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found or unauthorized' });
    }

    // Don't allow updates if ride has bookings
    const bookingCount = await Booking.countDocuments({ 
      ride: ride._id, 
      status: { $in: ['confirmed', 'pending'] } 
    });

    if (bookingCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot update ride with existing bookings' 
      });
    }

    const allowedUpdates = [
      'departure', 'destination', 'departureDate', 'departureTime',
      'pricePerSeat', 'totalSeats', 'description', 'preferences'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (updates.totalSeats) {
      updates.availableSeats = updates.totalSeats;
    }

    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.rideId,
      updates,
      { new: true, runValidators: true }
    ).populate('driver', 'firstName lastName profileImage rating totalReviews');

    res.json({ ride: updatedRide, message: 'Ride updated successfully' });
  } catch (error) {
    console.error('Update ride error:', error);
    res.status(500).json({ message: 'Server error during ride update' });
  }
});

// Cancel ride
router.delete('/:rideId', auth, requireRole(['driver']), async (req, res) => {
  try {
    const ride = await Ride.findOne({ _id: req.params.rideId, driver: req.user._id });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found or unauthorized' });
    }

    // Update ride status to cancelled
    ride.status = 'cancelled';
    await ride.save();

    // Cancel all associated bookings
    await Booking.updateMany(
      { ride: ride._id, status: { $in: ['pending', 'confirmed'] } },
      { status: 'cancelled' }
    );

    res.json({ message: 'Ride cancelled successfully' });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ message: 'Server error during ride cancellation' });
  }
});

module.exports = router;