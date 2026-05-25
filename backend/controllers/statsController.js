const Player = require('../models/Player');
const Training = require('../models/Training');
const Payment = require('../models/Payment');
const getMsg = require('../utils/messages');

const getDashboardStats = async (req, res) => {
  try {
    const coachId = req.coach._id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const totalPlayers = await Player.countDocuments({ coach: coachId, isActive: true });

    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const todayTraining = await Training.findOne({
      coach: coachId,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    const payments = await Payment.find({ coach: coachId, month, year });
    const totalIncome = payments.filter(p => p.status === 'tolangan').reduce((sum, p) => sum + p.amount, 0);
    const totalDebt = payments.filter(p => p.status !== 'tolangan').reduce((sum, p) => sum + p.amount, 0);
    const debtorCount = payments.filter(p => p.status !== 'tolangan').length;

    const recentTrainings = await Training.find({ coach: coachId, status: 'tugallangan' })
      .sort({ date: -1 })
      .limit(5)
      .select('title date attendance status');

    res.json({
      success: true,
      stats: {
        totalPlayers,
        todayTraining,
        totalIncome,
        totalDebt,
        debtorCount,
        recentTrainings
      }
    });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const getTeamStats = async (req, res) => {
  try {
    const coachId = req.coach._id;

    const players = await Player.find({ coach: coachId, isActive: true })
      .select('firstName lastName stats position photo');

    const topScorers = [...players].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 5);
    const topAssists = [...players].sort((a, b) => b.stats.assists - a.stats.assists).slice(0, 5);
    const topAttendance = [...players].sort((a, b) => b.stats.trainingsAttended - a.stats.trainingsAttended).slice(0, 5);

    const monthlyTrainings = await Training.aggregate([
      { $match: { coach: coachId, status: 'tugallangan' } },
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      players,
      topScorers,
      topAssists,
      topAttendance,
      monthlyTrainings
    });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const getIncomeStats = async (req, res) => {
  try {
    const coachId = req.coach._id;

    const monthlyIncome = await Payment.aggregate([
      { $match: { coach: coachId, status: 'tolangan' } },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({ success: true, monthlyIncome });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const getMyStats = async (req, res) => {
  try {
    const player = await Player.findById(req.playerId)
      .select('stats firstName lastName position age photo healthStatus team coach')
      .populate('team', 'name color')
      .populate('coach', 'firstName lastName photo');
    if (!player) {
      return res.status(404).json({ message: getMsg(req.lang).playerNotFound });
    }

    const trainings = await Training.find({
      'attendance.player': req.playerId,
      status: 'tugallangan'
    })
      .sort({ date: -1 })
      .limit(10)
      .select('title date attendance');

    const ratingHistory = trainings.map(t => {
      const att = t.attendance.find(a => a.player.toString() === req.playerId);
      return {
        date: t.date,
        title: t.title,
        rating: att?.rating || 0,
        goals: att?.goals || 0,
        assists: att?.assists || 0,
        distance: att?.distance || 0,
        status: att?.status || 'kelmadi'
      };
    }).reverse();

    res.json({
      success: true,
      stats: player.stats,
      ratingHistory,
      profile: {
        firstName: player.firstName,
        lastName: player.lastName,
        position: player.position,
        age: player.age,
        photo: player.photo,
        healthStatus: player.healthStatus,
        team: player.team,
        coach: player.coach
      }
    });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const getTopPlayers = async (req, res) => {
  try {
    const players = await Player.find({ coach: req.coachId, isActive: true })
      .select('firstName lastName stats position photo team')
      .populate('team', 'name color');

    const sorted = [...players].sort((a, b) => {
      const scoreA = (a.stats.goals * 2) + a.stats.assists + a.stats.trainingsAttended;
      const scoreB = (b.stats.goals * 2) + b.stats.assists + b.stats.trainingsAttended;
      return scoreB - scoreA;
    }).slice(0, 10);

    res.json({ success: true, players: sorted });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

module.exports = { getDashboardStats, getTeamStats, getIncomeStats, getMyStats, getTopPlayers };
