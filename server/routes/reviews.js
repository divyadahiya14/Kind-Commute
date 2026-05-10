const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create review (passengers only, after completed ride)
router.post('/', auth, requireRole(['passenger']), [
  body('rideId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 500 }),
  body('categories.punctuality').optional().isInt({ min: 1, max: 5 }),
  body('categories.friendliness').optional().isInt({ min: 1, max: 5 }),
  body('categories.cleanliness').optional().isInt({ min: 1, max: 5 }),
  body('categories.communication').optional().isInt({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, rating, comment, categories } = req.body;

    // Check if booking exists and is completed
    const booking = await Booking.findOne({
      ride: rideId,
      passenger: req.user._id,
      status: 'completed'
    }).populate('ride');

    if (!booking) {
      return res.status(404).json({ 
        message: 'No completed booking found for this ride' 
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      ride: rideId,
      reviewer: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this ride' });
    }

    // Create review
    const review = new Review({
      ride: rideId,
      reviewer: req.user._id,
      reviewee: booking.ride.driver,
      rating,
      comment,
      categories
    });

    await review.save();

    // Update driver's rating
    const driver = await User.findById(booking.ride.driver);
    driver.updateRating(rating);
    await driver.save();

    await review.populate([
      { path: 'reviewer', select: 'firstName lastName profileImage' },
      { path: 'reviewee', select: 'firstName lastName' },
      { path: 'ride', select: 'departure destination departureDate' }
    ]);

    res.status(201).json({ 
      review,
      message: 'Review submitted successfully' 
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error during review creation' });
  }
});

// Get reviews for a user (driver)
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'firstName lastName profileImage')
      .populate('ride', 'departure destination departureDate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ reviewee: req.params.userId });

    // Calculate average ratings by category
    const averages = await Review.aggregate([
      { $match: { reviewee: req.params.userId } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgPunctuality: { $avg: '$categories.punctuality' },
          avgFriendliness: { $avg: '$categories.friendliness' },
          avgCleanliness: { $avg: '$categories.cleanliness' },
          avgCommunication: { $avg: '$categories.communication' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      averages: averages[0] || {
        avgRating: 0,
        avgPunctuality: 0,
        avgFriendliness: 0,
        avgCleanliness: 0,
        avgCommunication: 0,
        totalReviews: 0
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews given by a user
router.get('/by-user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ reviewer: req.params.userId })
      .populate('reviewee', 'firstName lastName profileImage')
      .populate('ride', 'departure destination departureDate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ reviewer: req.params.userId });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get reviews by user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;