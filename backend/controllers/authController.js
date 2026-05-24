const jwt = require('jsonwebtoken');
const Coach = require('../models/Coach');
const Player = require('../models/Player');

// JWT token yaratish
const generateToken = (id, role, extra = {}) => {
  return jwt.sign({ id, role, ...extra }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Trener login
const coachLogin = async (req, res) => {
  console.log('Coach login boshlandi');
  try {
    const { email, password } = req.body;
    console.log('Email:', email, 'Password bor:', !!password);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email va parol kiritish shart.' });
    }

    console.log('DB dan trener qidirilmoqda...');
    const coach = await Coach.findOne({ email: email.toLowerCase(), isActive: true });
    console.log('Trener topildimi:', !!coach);

    if (!coach) {
      return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri.' });
    }

    console.log('Parol tekshirilmoqda...');
    const isMatch = await coach.comparePassword(password);
    console.log('Parol to\'g\'rimi:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri.' });
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
    res.status(500).json({ message: 'Server xatosi.', error: error.message });
  }
};

// Futbolchi login — 6 xonali kod bilan
const playerLogin = async (req, res) => {
  try {
    const { accessCode } = req.body;

    if (!accessCode || accessCode.length !== 6) {
      return res.status(400).json({ message: '6 xonali kod kiritish shart.' });
    }

    const player = await Player.findOne({ accessCode, isActive: true })
      .populate('coach', 'firstName lastName photo')
      .populate('team', 'name color');
    if (!player) {
      return res.status(401).json({ message: 'Noto\'g\'ri kod. Treneringizdan oling.' });
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
    res.status(500).json({ message: 'Server xatosi.', error: error.message });
  }
};

// FCM token yangilash (push notification uchun)
const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ message: 'FCM token kerak.' });

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token topilmadi.' });

    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);

    if (decoded.role === 'coach') {
      await Coach.findByIdAndUpdate(decoded.id, { fcmToken });
    } else if (decoded.role === 'player') {
      await Player.findByIdAndUpdate(decoded.id, { fcmToken });
    }

    res.json({ success: true });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token noto\'g\'ri.' });
    }
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Trener parolini o'zgartirish
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Joriy va yangi parol kiritilishi shart.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Yangi parol kamida 6 ta belgi bo'lishi kerak." });
    }

    const coach = await Coach.findById(req.coach._id);
    const isMatch = await coach.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Joriy parol noto'g'ri." });
    }

    coach.password = newPassword;
    await coach.save();

    res.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi." });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Trener o'z profilini olish (karta, WhatsApp ma'lumotlari bilan)
const getCoachProfile = async (req, res) => {
  try {
    const coach = await Coach.findById(req.coach._id)
      .select('-password -fcmToken');
    if (!coach) return res.status(404).json({ message: 'Topilmadi.' });
    res.json({ success: true, coach });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Trener to'lov ma'lumotlarini yangilash (karta, WhatsApp, oylik fee)
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
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

module.exports = { coachLogin, playerLogin, updateFcmToken, changePassword, updatePaymentInfo, getCoachProfile };
