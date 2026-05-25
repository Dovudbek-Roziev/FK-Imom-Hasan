const mongoose = require('mongoose');

const LineupPlayerSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  position: { type: String, default: '' },
  isStarter: { type: Boolean, default: true },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCard: { type: Boolean, default: false },
}, { _id: false });

const MatchSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  date: { type: Date, required: true },
  time: { type: String, default: '' },
  opponent: { type: String, required: true, trim: true },
  venue: { type: String, enum: ['home', 'away', 'neutral'], default: 'home' },
  location: { type: String, default: '', trim: true },
  competition: { type: String, default: '', trim: true },
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  scoreUs: { type: Number, default: 0 },
  scoreThem: { type: Number, default: 0 },
  lineup: [LineupPlayerSchema],
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);
