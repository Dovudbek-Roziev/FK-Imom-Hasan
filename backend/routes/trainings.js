const express = require('express');
const router = express.Router();
const {
  getTrainings, getTraining, createTraining,
  updateTraining, deleteTraining, getMyTrainings, getUpcomingTrainings, rsvpTraining
} = require('../controllers/trainingController');
const { authCoach, authPlayer } = require('../middleware/auth');

// FUTBOLCHI routes — /:id dan OLDIN bo'lishi shart
router.get('/my/history', authPlayer, getMyTrainings);
router.get('/my/upcoming', authPlayer, getUpcomingTrainings);
router.post('/my/rsvp/:id', authPlayer, rsvpTraining);

// TRENER routes
router.get('/', authCoach, getTrainings);
router.get('/:id', authCoach, getTraining);
router.post('/', authCoach, createTraining);
router.put('/:id', authCoach, updateTraining);
router.delete('/:id', authCoach, deleteTraining);

module.exports = router;
