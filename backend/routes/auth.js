const express = require('express');
const router = express.Router();
const { coachLogin, playerLogin, updateFcmToken, changePassword, updatePaymentInfo, getCoachProfile } = require('../controllers/authController');
const { authCoach, authPlayer } = require('../middleware/auth');

// Trener login
router.post('/coach/login', coachLogin);

// Futbolchi login (6 xonali kod)
router.post('/player/login', playerLogin);

// FCM token yangilash
router.post('/fcm-token', updateFcmToken);

// Parol o'zgartirish (trener)
router.put('/change-password', authCoach, changePassword);

// Trener o'z profilini olish
router.get('/me', authCoach, getCoachProfile);

// To'lov ma'lumotlarini yangilash (trener)
router.put('/update-payment-info', authCoach, updatePaymentInfo);

module.exports = router;
