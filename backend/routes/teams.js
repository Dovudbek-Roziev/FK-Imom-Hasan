const express = require('express');
const router = express.Router();
const { getTeams, addTeam, updateTeam, deleteTeam, assignPlayer } = require('../controllers/teamController');
const { authCoach } = require('../middleware/auth');

router.get('/', authCoach, getTeams);
router.post('/', authCoach, addTeam);
router.post('/assign', authCoach, assignPlayer);
router.put('/:id', authCoach, updateTeam);
router.delete('/:id', authCoach, deleteTeam);

module.exports = router;
