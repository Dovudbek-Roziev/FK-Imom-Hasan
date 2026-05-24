const Player = require('../models/Player');
const Training = require('../models/Training');
const Payment = require('../models/Payment');

// Trener dashboard statistikasi
const getDashboardStats = async (req, res) => {
  try {
    const coachId = req.coach._id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Jami futbolchilar
    const totalPlayers = await Player.countDocuments({ coach: coachId, isActive: true });

    // Bugungi trenirovka
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const todayTraining = await Training.findOne({
      coach: coachId,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    // Joriy oy to'lovlari
    const payments = await Payment.find({ coach: coachId, month, year });
    const totalIncome = payments.filter(p => p.status === 'tolangan').reduce((sum, p) => sum + p.amount, 0);
    const totalDebt = payments.filter(p => p.status !== 'tolangan').reduce((sum, p) => sum + p.amount, 0);
    const debtorCount = payments.filter(p => p.status !== 'tolangan').length;

    // Oxirgi 5 trenirovka
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
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Jamoa umumiy statistikasi
const getTeamStats = async (req, res) => {
  try {
    const coachId = req.coach._id;

    const players = await Player.find({ coach: coachId, isActive: true })
      .select('firstName lastName stats position photo');

    // Top golchilar
    const topScorers = [...players].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 5);

    // Top assistent beruvchilar
    const topAssists = [...players].sort((a, b) => b.stats.assists - a.stats.assists).slice(0, 5);

    // Eng ko'p kelgan
    const topAttendance = [...players].sort((a, b) => b.stats.trainingsAttended - a.stats.trainingsAttended).slice(0, 5);

    // Oylik trenirovkalar soni
    const now = new Date();
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
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Oylik daromad grafigi
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
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Futbolchi o'z statistikasini ko'rish
const getMyStats = async (req, res) => {
  try {
    const player = await Player.findById(req.playerId).select('stats firstName lastName');
    if (!player) {
      return res.status(404).json({ message: 'Futbolchi topilmadi.' });
    }

    // Oxirgi 10 trenirovkadagi baholar grafigi uchun
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
      ratingHistory
    });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Futbolchi uchun: o'z trenerining top futbolchilari
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
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

module.exports = { getDashboardStats, getTeamStats, getIncomeStats, getMyStats, getTopPlayers };
