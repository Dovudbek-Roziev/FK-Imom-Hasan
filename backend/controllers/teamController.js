const Team = require('../models/Team');
const Player = require('../models/Player');
const getMsg = require('../utils/messages');

const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ coach: req.coach._id, isActive: true }).sort({ createdAt: -1 });

    const counts = await Player.aggregate([
      { $match: { coach: req.coach._id, isActive: true, team: { $in: teams.map((t) => t._id) } } },
      { $group: { _id: '$team', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach((c) => { countMap[c._id.toString()] = c.count; });

    const result = teams.map((t) => ({
      ...t.toJSON(),
      playerCount: countMap[t._id.toString()] || 0
    }));

    res.json({ teams: result });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const addTeam = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: getMsg(req.lang).teamNameRequired });

    const team = await Team.create({
      name: name.trim(),
      description: description || '',
      color: color || '#3b82f6',
      coach: req.coach._id
    });

    res.status(201).json({ team });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: getMsg(req.lang).teamNameRequired });

    const team = await Team.findOneAndUpdate(
      { _id: req.params.id, coach: req.coach._id },
      { name: name.trim(), description, color },
      { new: true }
    );
    if (!team) return res.status(404).json({ message: getMsg(req.lang).teamNotFound });

    res.json({ team });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ _id: req.params.id, coach: req.coach._id });
    if (!team) return res.status(404).json({ message: getMsg(req.lang).teamNotFound });

    await Player.updateMany({ team: team._id }, { $set: { team: null } });
    await Team.deleteOne({ _id: team._id });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const assignPlayer = async (req, res) => {
  try {
    const { playerId, teamId } = req.body;
    const m = getMsg(req.lang);

    const player = await Player.findOne({ _id: playerId, coach: req.coach._id, isActive: true });
    if (!player) return res.status(404).json({ message: m.playerNotFound });

    if (teamId) {
      const team = await Team.findOne({ _id: teamId, coach: req.coach._id });
      if (!team) return res.status(404).json({ message: m.teamNotFound });
      player.team = teamId;
    } else {
      player.team = null;
    }

    await player.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

module.exports = { getTeams, addTeam, updateTeam, deleteTeam, assignPlayer };
