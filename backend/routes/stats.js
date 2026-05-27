const express = require('express');
const router = express.Router();
const { getDashboardStats, getTeamStats, getMyStats, getTopPlayers } = require('../controllers/statsController');
const { authCoach, authPlayer } = require('../middleware/auth');
const Player = require('../models/Player');
const Coach = require('../models/Coach');
const Training = require('../models/Training');
const Match = require('../models/Match');

// Public — auth siz, landing page uchun
router.get('/public', async (req, res) => {
  try {
    const [players, coaches, trainings, matches] = await Promise.all([
      Player.countDocuments(),
      Coach.countDocuments(),
      Training.countDocuments(),
      Match.countDocuments(),
    ]);
    res.json({ players, coaches, trainings, matches });
  } catch {
    res.json({ players: 0, coaches: 0, trainings: 0, matches: 0 });
  }
});

router.get('/dashboard', authCoach, getDashboardStats);
router.get('/team', authCoach, getTeamStats);
router.get('/my', authPlayer, getMyStats);
router.get('/top-players', authPlayer, getTopPlayers);

module.exports = router;
