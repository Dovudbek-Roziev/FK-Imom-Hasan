const Player = require('../models/Player');

// Bepul planda max 30 futbolchi tekshirish
const checkPlayerLimit = async (req, res, next) => {
  try {
    const coach = req.coach;

    // Premium bo'lsa cheklov yo'q
    if (coach.subscription.plan !== 'free') {
      return next();
    }

    const playerCount = await Player.countDocuments({
      coach: coach._id,
      isActive: true
    });

    if (playerCount >= 30) {
      return res.status(403).json({
        message: 'Bepul planda maksimal 30 ta futbolchi qo\'shish mumkin.',
        upgradeRequired: true,
        currentCount: playerCount,
        limit: 30
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// PDF hisobot faqat $20 plan uchun
const checkPremium20 = (req, res, next) => {
  const coach = req.coach;

  if (coach.subscription.plan !== 'premium_10') {
    return res.status(403).json({
      message: 'Bu funksiya faqat Premium Pro ($10) planda mavjud.',
      upgradeRequired: true
    });
  }

  next();
};

// Premium aktiv ekanligini tekshirish
const checkSubscriptionActive = async (req, res, next) => {
  try {
    const coach = req.coach;

    if (coach.subscription.plan === 'free') {
      return next();
    }

    const now = new Date();
    if (!coach.subscription.endDate || coach.subscription.endDate < now) {
      coach.subscription.plan = 'free';
      coach.subscription.isActive = false;
      await coach.save();
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = { checkPlayerLimit, checkPremium20, checkSubscriptionActive };
