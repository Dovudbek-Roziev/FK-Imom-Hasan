const Player = require('../models/Player');
const Payment = require('../models/Payment');
const getMsg = require('../utils/messages');

const generateUniqueCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    exists = await Player.findOne({ accessCode: code });
  }
  return code;
};

const getPlayers = async (req, res) => {
  try {
    const players = await Player.find({
      coach: req.coach._id,
      isActive: true
    }).populate('team', 'name color').sort({ firstName: 1 });

    res.json({ success: true, players, total: players.length });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const getPlayer = async (req, res) => {
  try {
    const player = await Player.findOne({
      _id: req.params.id,
      coach: req.coach._id
    });

    if (!player) {
      return res.status(404).json({ message: getMsg(req.lang).playerNotFound });
    }

    const payments = await Payment.find({ player: player._id })
      .sort({ year: -1, month: -1 })
      .limit(12);

    res.json({ success: true, player, payments });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

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

    res.status(201).json({ success: true, player, accessCode });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError, error: error.message });
  }
};

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
      return res.status(404).json({ message: getMsg(req.lang).playerNotFound });
    }

    res.json({ success: true, player });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const updateStats = async (req, res) => {
  try {
    const { goals, assists, totalDistance } = req.body;

    const player = await Player.findOneAndUpdate(
      { _id: req.params.id, coach: req.coach._id },
      { 'stats.goals': goals, 'stats.assists': assists, 'stats.totalDistance': totalDistance },
      { new: true }
    );

    if (!player) {
      return res.status(404).json({ message: getMsg(req.lang).playerNotFound });
    }

    res.json({ success: true, player });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findOneAndUpdate(
      { _id: req.params.id, coach: req.coach._id },
      { isActive: false }
    );

    if (!player) {
      return res.status(404).json({ message: getMsg(req.lang).playerNotFound });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const player = await Player.findById(req.playerId)
      .populate('coach', 'firstName lastName photo');

    if (!player) {
      return res.status(404).json({ message: getMsg(req.lang).profileNotFound });
    }

    res.json({ success: true, player });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

module.exports = { getPlayers, getPlayer, addPlayer, updatePlayer, updateStats, deletePlayer, getMyProfile };
