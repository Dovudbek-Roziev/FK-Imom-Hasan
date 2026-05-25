const jwt = require('jsonwebtoken');
const Coach = require('../models/Coach');
const Player = require('../models/Player');
const getMsg = require('../utils/messages');

const generateToken = (id, role, extra = {}) => {
  return jwt.sign({ id, role, ...extra }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const coachLogin = async (req, res) => {
  console.log('Coach login boshlandi');
  try {
    const { email, password } = req.body;
    const m = getMsg(req.lang);
    console.log('Email:', email, 'Password bor:', !!password);

    if (!email || !password) {
      return res.status(400).json({ message: m.emailPasswordRequired });
    }

    console.log('DB dan trener qidirilmoqda...');
    const coach = await Coach.findOne({ email: email.toLowerCase(), isActive: true });
    console.log('Trener topildimi:', !!coach);

    if (!coach) {
      return res.status(401).json({ message: m.invalidCredentials });
    }

    console.log('Parol tekshirilmoqda...');
    const isMatch = await coach.comparePassword(password);
    console.log('Parol to\'g\'rimi:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: m.invalidCredentials });
    }

    console.log('Token yaratilmoqda...');
    const token = generateToken(coach._id, 'coach');
    console.log('Token yaratildi');

    res.json({
      success: true,
      token,
      coach: {
        id: coach._id,
        firstName: coach.firstName,
        lastName: coach.lastName,
        email: coach.email,
        photo: coach.photo,
        subscription: coach.subscription
      }
    });
  } catch (error) {
    console.error('Coach login xatosi:', error.message, error.stack);
    res.status(500).json({ message: getMsg(req.lang).serverError, error: error.message });
  }
};

const playerLogin = async (req, res) => {
  try {
    const { accessCode } = req.body;
    const m = getMsg(req.lang);

    if (!accessCode || accessCode.length !== 6) {
      return res.status(400).json({ message: m.accessCodeRequired });
    }

    const player = await Player.findOne({ accessCode, isActive: true })
      .populate('coach', 'firstName lastName photo')
      .populate('team', 'name color');
    if (!player) {
      return res.status(401).json({ message: m.invalidAccessCode });
    }

    const token = generateToken(player._id, 'player', { coachId: player.coach._id });

    res.json({
      success: true,
      token,
      player: {
        id: player._id,
        firstName: player.firstName,
        lastName: player.lastName,
        position: player.position,
        photo: player.photo,
        age: player.age,
        stats: player.stats,
        healthStatus: player.healthStatus,
        coach: player.coach,
        team: player.team
      }
    });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError, error: error.message });
  }
};

const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const m = getMsg(req.lang);
    if (!fcmToken) return res.status(400).json({ message: m.fcmTokenRequired });

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: m.tokenRequiredShort });

    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);

    if (decoded.role === 'coach') {
      await Coach.findByIdAndUpdate(decoded.id, { fcmToken });
    } else if (decoded.role === 'player') {
      await Player.findByIdAndUpdate(decoded.id, { fcmToken });
    }

    res.json({ success: true });
  } catch (error) {
    const m = getMsg(req.lang);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: m.tokenInvalidShort });
    }
    res.status(500).json({ message: m.serverError });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const m = getMsg(req.lang);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: m.passwordRequired });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: m.passwordTooShort });
    }

    const coach = await Coach.findById(req.coach._id);
    const isMatch = await coach.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: m.currentPasswordWrong });
    }

    coach.password = newPassword;
    await coach.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const getCoachProfile = async (req, res) => {
  try {
    const coach = await Coach.findById(req.coach._id).select('-password -fcmToken');
    if (!coach) return res.status(404).json({ message: getMsg(req.lang).notFound });
    res.json({ success: true, coach });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const updatePaymentInfo = async (req, res) => {
  try {
    const { cardNumber, whatsappNumber, monthlyFee } = req.body;
    await Coach.findByIdAndUpdate(req.coach._id, {
      cardNumber: cardNumber || '',
      whatsappNumber: whatsappNumber || '',
      ...(monthlyFee !== undefined && { monthlyFee: Number(monthlyFee) || 0 })
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

module.exports = { coachLogin, playerLogin, updateFcmToken, changePassword, updatePaymentInfo, getCoachProfile };
