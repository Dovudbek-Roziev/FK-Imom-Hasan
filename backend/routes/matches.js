const express = require('express');
const router = express.Router();
const { authCoach, authPlayer } = require('../middleware/auth');
const mc = require('../controllers/matchController');

// Player route must be before /:id
router.get('/my', authPlayer, mc.getPlayerMatches);

router.get('/', authCoach, mc.getMatches);
router.post('/', authCoach, mc.createMatch);
router.put('/:id', authCoach, mc.updateMatch);
router.delete('/:id', authCoach, mc.deleteMatch);

module.exports = router;
