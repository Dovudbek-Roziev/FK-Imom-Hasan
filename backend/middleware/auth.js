const jwt = require('jsonwebtoken');
const Coach = require('../models/Coach');
const getMsg = require('../utils/messages');

const authCoach = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const m = getMsg(req.lang);

    if (!token) {
      return res.status(401).json({ message: m.tokenRequired });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const coach = await Coach.findById(decoded.id).select('-password');

    if (!coach || !coach.isActive) {
      return res.status(401).json({ message: m.coachBlocked });
    }

    req.coach = coach;
    next();
  } catch (error) {
    const m = getMsg(req.lang);
    return res.status(401).json({ message: m.tokenInvalid });
  }
};

const authAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const m = getMsg(req.lang);

  if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ message: m.adminUnauthorized });
  }

  next();
};

const authPlayer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const m = getMsg(req.lang);

    if (!token) {
      return res.status(401).json({ message: m.tokenRequiredShort });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'player') {
      return res.status(403).json({ message: m.playerUnauthorized });
    }

    req.playerId = decoded.id;
    req.coachId = decoded.coachId;
    next();
  } catch (error) {
    const m = getMsg(req.lang);
    return res.status(401).json({ message: m.tokenInvalidShort });
  }
};

module.exports = { authCoach, authAdmin, authPlayer };
