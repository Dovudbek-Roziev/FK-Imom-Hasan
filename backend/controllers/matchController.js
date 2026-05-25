const Match = require('../models/Match');
const getMsg = require('../utils/messages');

exports.getMatches = async (req, res) => {
  try {
    const matches = await Match.find({ coach: req.coach._id })
      .populate('team', 'name color')
      .populate('lineup.player', 'firstName lastName photo position')
      .sort({ date: -1 });
    res.json({ matches });
  } catch {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

exports.createMatch = async (req, res) => {
  try {
    const { date, time, opponent, venue, location, competition, team, notes } = req.body;
    if (!opponent || !date) return res.status(400).json({ message: getMsg(req.lang).allFieldsRequired });
    const match = await Match.create({
      coach: req.coach._id,
      date, time: time || '',
      opponent,
      venue: venue || 'home',
      location: location || '',
      competition: competition || '',
      team: team || null,
      notes: notes || '',
    });
    await match.populate('team', 'name color');
    res.status(201).json({ match });
  } catch {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

exports.updateMatch = async (req, res) => {
  try {
    const match = await Match.findOne({ _id: req.params.id, coach: req.coach._id });
    if (!match) return res.status(404).json({ message: getMsg(req.lang).notFound });

    const fields = ['date', 'time', 'opponent', 'venue', 'location', 'competition', 'status', 'scoreUs', 'scoreThem', 'lineup', 'notes'];
    fields.forEach(k => { if (req.body[k] !== undefined) match[k] = req.body[k]; });
    if (req.body.team !== undefined) match.team = req.body.team || null;

    await match.save();
    await match.populate('team', 'name color');
    await match.populate('lineup.player', 'firstName lastName photo position');
    res.json({ match });
  } catch {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

exports.deleteMatch = async (req, res) => {
  try {
    await Match.findOneAndDelete({ _id: req.params.id, coach: req.coach._id });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

exports.getPlayerMatches = async (req, res) => {
  try {
    if (!req.coachId) return res.json({ matches: [] });
    const matches = await Match.find({ coach: req.coachId })
      .populate('team', 'name color')
      .populate('lineup.player', 'firstName lastName photo')
      .sort({ date: -1 });
    res.json({ matches });
  } catch {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};
