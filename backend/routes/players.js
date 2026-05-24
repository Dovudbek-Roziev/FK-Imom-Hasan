const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getPlayers, getPlayer, addPlayer,
  updatePlayer, updateStats, deletePlayer, getMyProfile
} = require('../controllers/playerController');
const { authCoach, authPlayer } = require('../middleware/auth');
const { checkPlayerLimit, checkSubscriptionActive } = require('../middleware/subscription');
const { playerPhotoStorage } = require('../config/cloudinary');

const upload = multer({
  storage: playerPhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(file.mimetype.split('/')[1])) {
      cb(null, true);
    } else {
      cb(new Error('Faqat rasm fayl qabul qilinadi.'));
    }
  }
});

// FUTBOLCHI routes — /:id dan OLDIN bo'lishi shart
router.get('/me/profile', authPlayer, getMyProfile);

// TRENER routes
router.get('/', authCoach, checkSubscriptionActive, getPlayers);
router.get('/:id', authCoach, getPlayer);
router.post('/', authCoach, checkSubscriptionActive, checkPlayerLimit, upload.single('photo'), addPlayer);
router.put('/:id', authCoach, upload.single('photo'), updatePlayer);
router.put('/:id/stats', authCoach, updateStats);
router.delete('/:id', authCoach, deletePlayer);

module.exports = router;
