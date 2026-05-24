const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  // Asosiy ma'lumotlar
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
  dateOfBirth: {
    type: Date,
    required: true
  },
  position: {
    type: String,
    enum: ['goalkeeper', 'defender', 'midfielder', 'forward'],
    required: true
  },
  photo: {
    type: String,
    default: null
  },
  // Kirish kodi — 6 xonali
  accessCode: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 6
  },
  // Qaysi trenerga tegishli
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true
  },
  // Qaysi jamoaga tegishli
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  // Sog'liq holati
  healthStatus: {
    type: String,
    enum: ['healthy', 'injured', 'sick', 'resting'],
    default: 'healthy'
  },
  // Umumiy statistika
  stats: {
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 }, // km
    trainingsAttended: { type: Number, default: 0 },
    totalTrainings: { type: Number, default: 0 }
  },
  // Push notification token
  fcmToken: {
    type: String,
    default: null
  },
  // Izohlar
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Yosh hisoblash
PlayerSchema.virtual('age').get(function() {
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

// Davomat foizi
PlayerSchema.virtual('attendanceRate').get(function() {
  if (this.stats.totalTrainings === 0) return 0;
  return Math.round((this.stats.trainingsAttended / this.stats.totalTrainings) * 100);
});

PlayerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Player', PlayerSchema);
