const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['driver', 'passenger', 'both'],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  dateOfBirth: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  preferences: {
    pets: { type: Boolean, default: false },
    music: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
    smoking: { type: Boolean, default: false }
  },
  carInfo: {
    make: String,
    model: String,
    year: Number,
    color: String,
    plateNumber: String
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Update rating method
userSchema.methods.updateRating = function(newRating) {
  this.rating = ((this.rating * this.totalReviews) + newRating) / (this.totalReviews + 1);
  this.totalReviews += 1;
};

module.exports = mongoose.model('User', userSchema);