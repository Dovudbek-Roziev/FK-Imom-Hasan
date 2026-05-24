const express = require('express');
const router = express.Router();
const { getDashboardStats, getTeamStats, getMyStats, getTopPlayers } = require('../controllers/statsController');
const { authCoach, authPlayer } = require('../middleware/auth');

router.get('/dashboard', authCoach, getDashboardStats);
router.get('/team', authCoach, getTeamStats);
router.get('/my', authPlayer, getMyStats);
router.get('/top-players', authPlayer, getTopPlayers);

module.exports = router;
