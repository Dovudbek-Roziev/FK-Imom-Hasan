const express = require('express');
const router = express.Router();
const {
  getCoaches, createCoach, updateCoachPassword,
  grantPremium, revokePremium, getAdminStats, toggleCoachStatus
} = require('../controllers/adminController');
const { authAdmin } = require('../middleware/auth');

// Barcha admin routelari himoyalangan
router.use(authAdmin);

// Statistika
router.get('/stats', getAdminStats);

// Trenerlar
router.get('/coaches', getCoaches);
router.post('/coaches', createCoach);
router.put('/coaches/:id/password', updateCoachPassword);
router.put('/coaches/:id/toggle', toggleCoachStatus);

// Premium boshqarish
router.post('/premium/grant', grantPremium);
router.delete('/premium/:id', revokePremium);

module.exports = router;
