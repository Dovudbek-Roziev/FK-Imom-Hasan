const Coach = require('../models/Coach');
const Player = require('../models/Player');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');

// Barcha trenerlar ro'yxati
const getCoaches = async (req, res) => {
  try {
    const coaches = await Coach.find().select('-password').sort({ createdAt: -1 });

    const coachesWithStats = await Promise.all(coaches.map(async (coach) => {
      const playerCount = await Player.countDocuments({ coach: coach._id, isActive: true });
      return { ...coach.toJSON(), playerCount };
    }));

    res.json({ success: true, coaches: coachesWithStats, total: coaches.length });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Yangi trener yaratish (faqat admin)
const createCoach = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Barcha maydonlar to\'ldirilishi shart.' });
    }

    const existing = await Coach.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan.' });
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
      message: 'Trener yaratildi.',
      coach: {
        id: coach._id,
        firstName: coach.firstName,
        lastName: coach.lastName,
        email: coach.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.', error: error.message });
  }
};

// Trener parolini yangilash
const updateCoachPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Parol kamida 6 ta belgi bo\'lishi shart.' });
    }

    const coach = await Coach.findById(req.params.id);

    if (!coach) {
      return res.status(404).json({ message: 'Trener topilmadi.' });
    }

    coach.password = newPassword;
    await coach.save();

    res.json({ success: true, message: 'Parol yangilandi.' });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Trenerga premium berish (qo'lda)
const grantPremium = async (req, res) => {
  try {
    const { coachId, plan, months = 1 } = req.body;

    const coach = await Coach.findById(coachId);
    if (!coach) {
      return res.status(404).json({ message: 'Trener topilmadi.' });
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

    res.json({ success: true, message: `${plan} berildi.`, coach });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Trenerning premiumini bekor qilish
const revokePremium = async (req, res) => {
  try {
    const coach = await Coach.findByIdAndUpdate(req.params.id, {
      'subscription.plan': 'free',
      'subscription.isActive': false
    });

    if (!coach) return res.status(404).json({ message: 'Trener topilmadi.' });

    res.json({ success: true, message: 'Premium bekor qilindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Admin dashboard statistikasi
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
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Trenerga bloklash / blokdan chiqarish
const toggleCoachStatus = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Trener topilmadi.' });
    }

    coach.isActive = !coach.isActive;
    await coach.save();

    res.json({
      success: true,
      message: coach.isActive ? 'Trener faollashtirildi.' : 'Trener bloklandi.',
      isActive: coach.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Trenerni o'chirish
const deleteCoach = async (req, res) => {
  try {
    const coach = await Coach.findByIdAndDelete(req.params.id);
    if (!coach) return res.status(404).json({ message: 'Trener topilmadi.' });
    await Player.deleteMany({ coach: req.params.id });
    res.json({ success: true, message: 'Trener o\'chirildi.' });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

module.exports = {
  getCoaches, createCoach, updateCoachPassword,
  grantPremium, revokePremium, getAdminStats, toggleCoachStatus, deleteCoach
};
