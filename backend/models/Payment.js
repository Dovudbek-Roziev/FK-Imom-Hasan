const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true
  },
  // To'lov miqdori (so'mda)
  amount: {
    type: Number,
    required: true
  },
  // Qaysi oy uchun
  month: {
    type: Number, // 1-12
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  // To'lov muddati
  dueDate: {
    type: Date,
    required: true
  },
  // To'lov holati
  status: {
    type: String,
    enum: ['tolangan', 'tolmagan', 'kechikkan'],
    default: 'tolmagan'
  },
  // To'langan sana
  paidDate: {
    type: Date,
    default: null
  },
  // To'lov usuli
  paymentMethod: {
    type: String,
    enum: ['payme', 'click', 'mbank', 'karta', 'naqd'],
    default: null
  },
  // To'lov tasdiq raqami
  transactionId: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Har oy uchun to'lov holatini avtomatik yangilash
PaymentSchema.pre('save', function(next) {
  const today = new Date();
  if (this.status === 'tolmagan' && this.dueDate < today) {
    this.status = 'kechikkan';
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
