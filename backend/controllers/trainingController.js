const Training = require('../models/Training');
const Player = require('../models/Player');

// Barcha trenirovkalarni olish
const getTrainings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, team } = req.query;
    const filter = { coach: req.coach._id };
    if (status) filter.status = status;
    if (team) filter.team = team;

    const trainings = await Training.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('attendance.player', 'firstName lastName photo position')
      .populate('team', 'name color');

    const total = await Training.countDocuments(filter);

    res.json({ success: true, trainings, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Bitta trenirovka
const getTraining = async (req, res) => {
  try {
    const training = await Training.findOne({ _id: req.params.id, coach: req.coach._id })
      .populate('attendance.player', 'firstName lastName photo position');

    if (!training) {
      return res.status(404).json({ message: 'Trenirovka topilmadi.' });
    }

    res.json({ success: true, training });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Yangi trenirovka yaratish
const createTraining = async (req, res) => {
  try {
    const { title, date, days, startTime, endTime, location, exercises, notes, team } = req.body;

    const playerFilter = { coach: req.coach._id, isActive: true };
    if (team) playerFilter.team = team;
    const players = await Player.find(playerFilter);

    const attendance = players.map(p => ({
      player: p._id,
      status: 'kelmadi',
      rating: null,
      goals: 0,
      assists: 0,
      distance: 0
    }));

    const training = new Training({
      coach: req.coach._id,
      team: team || null,
      title,
      date: date || null,
      days: days || [],
      startTime,
      endTime,
      location,
      exercises: exercises || [],
      attendance,
      notes
    });

    await training.save();

    // Shu futbolchilar uchun totalTrainings +1
    await Player.updateMany(
      playerFilter,
      { $inc: { 'stats.totalTrainings': 1 } }
    );

    res.status(201).json({ success: true, training });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.', error: error.message });
  }
};

// Trenirovkani yangilash (davomat, baholar)
const updateTraining = async (req, res) => {
  try {
    const { title, date, days, startTime, endTime, location, exercises, attendance, status, notes, team } = req.body;

    const training = await Training.findOne({ _id: req.params.id, coach: req.coach._id });
    if (!training) {
      return res.status(404).json({ message: 'Trenirovka topilmadi.' });
    }

    // Davomat yangilanganda futbolchi statistikasini ham yangilash
    if (attendance && training.status !== 'tugallangan' && status === 'tugallangan') {
      for (const att of attendance) {
        const updateData = {};

        if (att.status === 'keldi' || att.status === 'kech_keldi') {
          updateData['$inc'] = {
            'stats.trainingsAttended': 1,
            'stats.goals': att.goals || 0,
            'stats.assists': att.assists || 0,
            'stats.totalDistance': att.distance || 0
          };
        }

        if (Object.keys(updateData).length > 0) {
          await Player.findByIdAndUpdate(att.player, updateData);
        }
      }
    }

    const updated = await Training.findByIdAndUpdate(
      req.params.id,
      { title, date: date || null, days: days || [], startTime, endTime, location, exercises, attendance, status, notes, ...(team !== undefined && { team: team || null }) },
      { new: true }
    ).populate('attendance.player', 'firstName lastName photo').populate('team', 'name color');

    res.json({ success: true, training: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Trenirovkani o'chirish
const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findOneAndDelete({ _id: req.params.id, coach: req.coach._id });

    if (!training) {
      return res.status(404).json({ message: 'Trenirovka topilmadi.' });
    }

    res.json({ success: true, message: 'Trenirovka o\'chirildi.' });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Futbolchi o'z trenirovkalarini ko'rish
const getMyTrainings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const trainings = await Training.find({
      'attendance.player': req.playerId,
      status: 'tugallangan'
    })
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title date startTime location attendance status');

    // Faqat shu futbolchi ma'lumotlarini qaytarish
    const myTrainings = trainings.map(t => {
      const myAtt = t.attendance.find(a => a.player.toString() === req.playerId);
      return {
        _id: t._id,
        title: t.title,
        date: t.date,
        startTime: t.startTime,
        location: t.location,
        myAttendance: myAtt
      };
    });

    res.json({ success: true, trainings: myTrainings });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Kelgusi trenirovkalar (futbolchi uchun)
const getUpcomingTrainings = async (req, res) => {
  try {
    const trainings = await Training.find({
      coach: req.coachId,
      status: 'rejalashtirilgan',
      $or: [
        { date: { $gte: new Date() } },
        { days: { $exists: true, $ne: [] } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title date days startTime endTime location team')
      .populate('team', 'name color');

    res.json({ success: true, trainings });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

module.exports = {
  getTrainings, getTraining, createTraining,
  updateTraining, deleteTraining, getMyTrainings, getUpcomingTrainings
};
