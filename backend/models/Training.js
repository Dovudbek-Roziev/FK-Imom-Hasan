const mongoose = require('mongoose');

// Har bir futbolchining trenirovkadagi holati
const AttendanceSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  status: {
    type: String,
    enum: ['keldi', 'kelmadi', 'kech_keldi', 'sababli'],
    default: 'kelmadi'
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  distance: { type: Number, default: 0 }, // km
  notes: { type: String, default: '' }
});

const TrainingSchema = new mongoose.Schema({
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  days: [{
    type: String,
    enum: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']
  }],
  date: {
    type: Date,
    required: false
  },
  startTime: {
    type: String,
    required: true // "09:00" formatda
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  // Mashqlar ro'yxati
  exercises: [{
    name: String,
    duration: Number, // daqiqa
    description: String
  }],
  // Futbolchilar davomati
  attendance: [AttendanceSchema],
  // Trenirovka holati
  status: {
    type: String,
    enum: ['rejalashtirilgan', 'tugallangan', 'bekor_qilindi'],
    default: 'rejalashtirilgan'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Kelganlar soni
TrainingSchema.virtual('presentCount').get(function() {
  return this.attendance.filter(a => a.status === 'keldi' || a.status === 'kech_keldi').length;
});

TrainingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Training', TrainingSchema);
