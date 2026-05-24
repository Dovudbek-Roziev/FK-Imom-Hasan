const express = require('express');
const router = express.Router();
const { coachLogin, playerLogin, updateFcmToken, changePassword } = require('../controllers/authController');
const { authCoach, authPlayer } = require('../middleware/auth');

// Trener login
router.post('/coach/login', coachLogin);

// Futbolchi login (6 xonali kod)
router.post('/player/login', playerLogin);

// FCM token yangilash
router.post('/fcm-token', updateFcmToken);

// Parol o'zgartirish (trener)
router.put('/change-password', authCoach, changePassword);

module.exports = router;
