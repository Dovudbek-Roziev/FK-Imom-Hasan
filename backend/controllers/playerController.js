const Player = require('../models/Player');
const Payment = require('../models/Payment');

// 6 xonali noyob kod generatsiya qilish
const generateUniqueCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    exists = await Player.findOne({ accessCode: code });
  }
  return code;
};

// Barcha futbolchilarni olish
const getPlayers = async (req, res) => {
  try {
    const players = await Player.find({
      coach: req.coach._id,
      isActive: true
    }).populate('team', 'name color').sort({ firstName: 1 });

    res.json({ success: true, players, total: players.length });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Bitta futbolchi profili
const getPlayer = async (req, res) => {
  try {
    const player = await Player.findOne({
      _id: req.params.id,
      coach: req.coach._id
    });

    if (!player) {
      return res.status(404).json({ message: 'Futbolchi topilmadi.' });
    }

    // To'lov ma'lumotlarini ham olib kelish
    const payments = await Payment.find({ player: player._id })
      .sort({ year: -1, month: -1 })
      .limit(12);

    res.json({ success: true, player, payments });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Yangi futbolchi qo'shish
const addPlayer = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, position, notes, monthlyFee, paymentDueDay, team } = req.body;

    const accessCode = await generateUniqueCode();

    const player = new Player({
      firstName,
      lastName,
      dateOfBirth,
      position,
      notes,
      coach: req.coach._id,
      accessCode,
      photo: req.file ? req.file.path : null,
      team: team || null
    });

    await player.save();

    // Joriy oy uchun to'lov yozuvi yaratish
    if (monthlyFee) {
      const now = new Date();
      const dueDay = paymentDueDay || 5;
      const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);

      await Payment.create({
        player: player._id,
        coach: req.coach._id,
        amount: monthlyFee,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        dueDate
      });
    }

    res.status(201).json({
      success: true,
      message: 'Futbolchi qo\'shildi.',
      player,
      accessCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.', error: error.message });
  }
};

// Futbolchi ma'lumotlarini yangilash
const updatePlayer = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, position, healthStatus, notes, team } = req.body;

    const updateData = { firstName, lastName, dateOfBirth, position, healthStatus, notes, team: team || null };

    if (req.file) {
      updateData.photo = req.file.path;
    }

    const player = await Player.findOneAndUpdate(
      { _id: req.params.id, coach: req.coach._id },
      updateData,
      { new: true }
    );

    if (!player) {
      return res.status(404).json({ message: 'Futbolchi topilmadi.' });
    }

    res.json({ success: true, player });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Futbolchi statistikasini yangilash
const updateStats = async (req, res) => {
  try {
    const { goals, assists, totalDistance } = req.body;

    const player = await Player.findOneAndUpdate(
      { _id: req.params.id, coach: req.coach._id },
      { 'stats.goals': goals, 'stats.assists': assists, 'stats.totalDistance': totalDistance },
      { new: true }
    );

    if (!player) {
      return res.status(404).json({ message: 'Futbolchi topilmadi.' });
    }

    res.json({ success: true, player });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Futbolchini o'chirish (soft delete)
const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findOneAndUpdate(
      { _id: req.params.id, coach: req.coach._id },
      { isActive: false }
    );

    if (!player) {
      return res.status(404).json({ message: 'Futbolchi topilmadi.' });
    }

    res.json({ success: true, message: 'Futbolchi o\'chirildi.' });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Futbolchi o'z profilini ko'rish (6 xonali kod bilan kirgandan keyin)
const getMyProfile = async (req, res) => {
  try {
    const player = await Player.findById(req.playerId)
      .populate('coach', 'firstName lastName photo');

    if (!player) {
      return res.status(404).json({ message: 'Profil topilmadi.' });
    }

    res.json({ success: true, player });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

module.exports = { getPlayers, getPlayer, addPlayer, updatePlayer, updateStats, deletePlayer, getMyProfile };
