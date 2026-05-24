const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CoachSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  photo: {
    type: String,
    default: null
  },
  // Premium tizimi
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium_5', 'premium_10'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  // Push notification token
  fcmToken: {
    type: String,
    default: null
  },
  // Admin tomonidan yaratilgan
  createdByAdmin: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Parolni hash qilish
CoachSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Parol tekshirish
CoachSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Bepul planda max 30 futbolchi
CoachSchema.methods.canAddPlayer = function(currentPlayerCount) {
  if (this.subscription.plan !== 'free') return true;
  return currentPlayerCount < 30;
};

module.exports = mongoose.model('Coach', CoachSchema);
