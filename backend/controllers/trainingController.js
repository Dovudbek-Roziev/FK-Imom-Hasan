const Training = require('../models/Training');
const Player = require('../models/Player');
const getMsg = require('../utils/messages');

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
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const getTraining = async (req, res) => {
  try {
    const training = await Training.findOne({ _id: req.params.id, coach: req.coach._id })
      .populate('attendance.player', 'firstName lastName photo position');

    if (!training) {
      return res.status(404).json({ message: getMsg(req.lang).trainingNotFound });
    }

    res.json({ success: true, training });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

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

    await Player.updateMany(
      playerFilter,
      { $inc: { 'stats.totalTrainings': 1 } }
    );

    res.status(201).json({ success: true, training });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError, error: error.message });
  }
};

const updateTraining = async (req, res) => {
  try {
    const { title, date, days, startTime, endTime, location, exercises, attendance, status, notes, team } = req.body;

    const training = await Training.findOne({ _id: req.params.id, coach: req.coach._id });
    if (!training) {
      return res.status(404).json({ message: getMsg(req.lang).trainingNotFound });
    }

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
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findOneAndDelete({ _id: req.params.id, coach: req.coach._id });

    if (!training) {
      return res.status(404).json({ message: getMsg(req.lang).trainingNotFound });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

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
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const getUpcomingTrainings = async (req, res) => {
  try {
    if (!req.coachId) return res.json({ success: true, trainings: [] });

    const trainings = await Training.find({
      coach: req.coachId,
      status: 'rejalashtirilgan',
      'attendance.player': req.playerId,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('title date days startTime endTime location team attendance')
      .populate('team', 'name color');

    const result = trainings.map(t => {
      const myAtt = t.attendance.find(a => a.player.toString() === req.playerId.toString());
      return {
        _id: t._id,
        title: t.title,
        date: t.date,
        days: t.days,
        startTime: t.startTime,
        endTime: t.endTime,
        location: t.location,
        team: t.team,
        myResponse: myAtt?.playerResponse || null,
      };
    });

    res.json({ success: true, trainings: result });
  } catch (error) {
    console.error('getUpcomingTrainings xatosi:', error);
    res.status(500).json({ message: getMsg(req.lang).serverError, error: error.message });
  }
};

const rsvpTraining = async (req, res) => {
  try {
    const { response } = req.body;
    if (!['kelaman', 'kelmayman'].includes(response)) {
      return res.status(400).json({ message: getMsg(req.lang).serverError });
    }

    const training = await Training.findOne({
      _id: req.params.id,
      status: 'rejalashtirilgan',
    });

    if (!training) {
      return res.status(404).json({ message: getMsg(req.lang).trainingNotFound });
    }

    const att = training.attendance.find(a => a.player.toString() === req.playerId.toString());
    if (!att) {
      return res.status(404).json({ message: getMsg(req.lang).trainingNotFound });
    }

    att.playerResponse = response;
    await training.save();

    res.json({ success: true, playerResponse: response });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

module.exports = {
  getTrainings, getTraining, createTraining,
  updateTraining, deleteTraining, getMyTrainings, getUpcomingTrainings, rsvpTraining
};
