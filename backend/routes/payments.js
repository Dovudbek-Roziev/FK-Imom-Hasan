const express = require('express');
const router = express.Router();
const {
  getPayments, setMonthlyFee, confirmPayment,
  makePayment, sendReminder, getMyPayments
} = require('../controllers/paymentController');
const { getIncomeStats } = require('../controllers/statsController');
const { authCoach, authPlayer } = require('../middleware/auth');

// TRENER routes
router.get('/', authCoach, getPayments);
router.post('/set-fee', authCoach, setMonthlyFee);
router.put('/:id/confirm', authCoach, confirmPayment);
router.post('/reminder', authCoach, sendReminder);
router.get('/income-stats', authCoach, getIncomeStats);

// FUTBOLCHI routes
router.get('/my', authPlayer, getMyPayments);
router.post('/pay', authPlayer, makePayment);

module.exports = router;
