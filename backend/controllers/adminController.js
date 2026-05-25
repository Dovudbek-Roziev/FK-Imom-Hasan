const Coach = require('../models/Coach');
const Player = require('../models/Player');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const getMsg = require('../utils/messages');

const getCoaches = async (req, res) => {
  try {
    const coaches = await Coach.find().select('-password').sort({ createdAt: -1 });

    const coachesWithStats = await Promise.all(coaches.map(async (coach) => {
      const playerCount = await Player.countDocuments({ coach: coach._id, isActive: true });
      return { ...coach.toJSON(), playerCount };
    }));

    res.json({ success: true, coaches: coachesWithStats, total: coaches.length });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const createCoach = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const m = getMsg(req.lang);

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: m.allFieldsRequired });
    }

    const existing = await Coach.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: m.emailTaken });
    }

    const coach = new Coach({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      createdByAdmin: true
    });

    await coach.save();

    res.status(201).json({
      success: true,
      coach: {
        id: coach._id,
        firstName: coach.firstName,
        lastName: coach.lastName,
        email: coach.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError, error: error.message });
  }
};

const updateCoachPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const m = getMsg(req.lang);

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: m.passwordTooShortAdmin });
    }

    const coach = await Coach.findById(req.params.id);

    if (!coach) {
      return res.status(404).json({ message: m.coachNotFound });
    }

    coach.password = newPassword;
    await coach.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const grantPremium = async (req, res) => {
  try {
    const { coachId, plan, months = 1 } = req.body;

    const coach = await Coach.findById(coachId);
    if (!coach) {
      return res.status(404).json({ message: getMsg(req.lang).coachNotFound });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const planAmounts = { free: 0, premium_5: 5, premium_10: 10 };

    coach.subscription = {
      plan,
      startDate,
      endDate,
      isActive: true
    };

    await coach.save();

    await Subscription.create({
      coach: coachId,
      plan,
      amount: planAmounts[plan] * months,
      paymentMethod: 'karta',
      startDate,
      endDate,
      status: 'active'
    });

    res.json({ success: true, coach });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const revokePremium = async (req, res) => {
  try {
    const coach = await Coach.findByIdAndUpdate(req.params.id, {
      'subscription.plan': 'free',
      'subscription.isActive': false
    });

    if (!coach) return res.status(404).json({ message: getMsg(req.lang).coachNotFound });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const totalCoaches = await Coach.countDocuments();
    const totalPlayers = await Player.countDocuments({ isActive: true });
    const premiumCoaches = await Coach.countDocuments({ 'subscription.plan': { $ne: 'free' } });

    const now = new Date();
    const monthlyRevenue = await Subscription.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalRevenue = await Subscription.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalCoaches,
        totalPlayers,
        premiumCoaches,
        freeCoaches: totalCoaches - premiumCoaches,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const toggleCoachStatus = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: getMsg(req.lang).coachNotFound });
    }

    coach.isActive = !coach.isActive;
    await coach.save();

    res.json({ success: true, isActive: coach.isActive });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const deleteCoach = async (req, res) => {
  try {
    const coach = await Coach.findByIdAndDelete(req.params.id);
    if (!coach) return res.status(404).json({ message: getMsg(req.lang).coachNotFound });
    await Player.deleteMany({ coach: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

module.exports = {
  getCoaches, createCoach, updateCoachPassword,
  grantPremium, revokePremium, getAdminStats, toggleCoachStatus, deleteCoach
};
