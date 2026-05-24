const jwt = require('jsonwebtoken');
const Coach = require('../models/Coach');

// Trener autentifikatsiyasi
const authCoach = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token topilmadi. Iltimos, kiring.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const coach = await Coach.findById(decoded.id).select('-password');

    if (!coach || !coach.isActive) {
      return res.status(401).json({ message: 'Trener topilmadi yoki bloklangan.' });
    }

    req.coach = coach;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token noto\'g\'ri yoki muddati o\'tgan.' });
  }
};

// Admin autentifikatsiyasi
const authAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ message: 'Admin huquqi yo\'q.' });
  }

  next();
};

// Futbolchi — kod bilan kirish (JWT siz)
const authPlayer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token topilmadi.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'player') {
      return res.status(403).json({ message: 'Futbolchi huquqi yo\'q.' });
    }

    req.playerId = decoded.id;
    req.coachId = decoded.coachId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token noto\'g\'ri.' });
  }
};

module.exports = { authCoach, authAdmin, authPlayer };
