const express = require('express');
const router = express.Router();
const {
  getPayments, setMonthlyFee, setFeeForAll, confirmPayment,
  makePayment, sendReminder, getMyPayments, getCoachPaymentInfo
} = require('../controllers/paymentController');
const { getIncomeStats } = require('../controllers/statsController');
const { authCoach, authPlayer } = require('../middleware/auth');

// TRENER routes
router.get('/', authCoach, getPayments);
router.post('/set-fee', authCoach, setMonthlyFee);
router.post('/set-fee-all', authCoach, setFeeForAll);
router.put('/:id/confirm', authCoach, confirmPayment);
router.post('/reminder', authCoach, sendReminder);
router.get('/income-stats', authCoach, getIncomeStats);

// FUTBOLCHI routes
router.get('/coach-info', authPlayer, getCoachPaymentInfo);
router.get('/my', authPlayer, getMyPayments);
router.post('/pay', authPlayer, makePayment);

module.exports = router;
