const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'premium_5', 'premium_10'],
    required: true
  },
  // Plan narxlari
  amount: {
    type: Number,
    required: true // USD da
  },
  // To'lov usuli
  paymentMethod: {
    type: String,
    enum: ['payme', 'click', 'mbank', 'karta'],
    required: true
  },
  transactionId: {
    type: String,
    default: null
  },
  // Boshlanish va tugash sanasi
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // Avtomatik yangilanish
  autoRenew: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
