const Payment = require('../models/Payment');
const Player = require('../models/Player');
const Coach = require('../models/Coach');
const { sendNotification } = require('./notificationController');
const getMsg = require('../utils/messages');

const getPayments = async (req, res) => {
  try {
    const { month, year, status } = req.query;
    const now = new Date();
    const filter = {
      coach: req.coach._id,
      month: month ? parseInt(month) : now.getMonth() + 1,
      year: year ? parseInt(year) : now.getFullYear()
    };
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('player', 'firstName lastName photo position')
      .sort({ status: 1 });

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments.filter(p => p.status === 'tolangan').reduce((sum, p) => sum + p.amount, 0);
    const debtAmount = totalAmount - paidAmount;

    res.json({
      success: true,
      payments,
      stats: {
        total: totalAmount,
        paid: paidAmount,
        debt: debtAmount,
        paidCount: payments.filter(p => p.status === 'tolangan').length,
        unpaidCount: payments.filter(p => p.status === 'tolmagan').length,
        overdueCount: payments.filter(p => p.status === 'kechikkan').length
      }
    });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const setMonthlyFee = async (req, res) => {
  try {
    const { playerId, amount, month, year, dueDay = 5 } = req.body;

    const player = await Player.findOne({ _id: playerId, coach: req.coach._id });
    if (!player) {
      return res.status(404).json({ message: getMsg(req.lang).playerNotFound });
    }

    const dueDate = new Date(year, month - 1, dueDay);

    const payment = await Payment.findOneAndUpdate(
      { player: playerId, month, year, coach: req.coach._id },
      { amount, dueDate, status: 'tolmagan', coach: req.coach._id, player: playerId, month, year },
      { upsert: true, new: true }
    );

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { paymentMethod, transactionId, notes } = req.body;

    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, coach: req.coach._id },
      {
        status: 'tolangan',
        paidDate: new Date(),
        paymentMethod,
        transactionId,
        notes
      },
      { new: true }
    ).populate('player', 'firstName lastName fcmToken');

    if (!payment) {
      return res.status(404).json({ message: getMsg(req.lang).paymentNotFound });
    }

    if (payment.player.fcmToken) {
      await sendNotification(
        payment.player.fcmToken,
        'To\'lov tasdiqlandi ✅',
        `${payment.amount.toLocaleString()} so\'m to\'lovingiz tasdiqlandi.`
      );
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const makePayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const m = getMsg(req.lang);

    const payment = await Payment.findOne({
      _id: paymentId,
      player: req.playerId
    }).populate('coach', 'firstName lastName fcmToken');

    if (!payment) {
      return res.status(404).json({ message: m.paymentNotFound });
    }

    if (payment.status === 'tolangan') {
      return res.status(400).json({ message: m.paymentAlreadyPaid });
    }

    if (payment.notes === 'player_notified') {
      return res.status(400).json({ message: m.paymentAlreadyNotified });
    }

    payment.notes = 'player_notified';
    await payment.save();

    const player = await Player.findById(req.playerId);
    if (payment.coach?.fcmToken && player) {
      await sendNotification(
        payment.coach.fcmToken,
        'To\'lov xabari 💰',
        `${player.firstName} ${player.lastName} ${payment.amount.toLocaleString()} so\'m to\'laganligini bildirdi. Tasdiqlang.`
      );
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const sendReminder = async (req, res) => {
  try {
    const { playerId } = req.body;

    const player = await Player.findOne({ _id: playerId, coach: req.coach._id });
    if (!player || !player.fcmToken) {
      return res.status(404).json({ message: getMsg(req.lang).playerNotFoundOrNoToken });
    }

    const unpaidPayments = await Payment.find({
      player: playerId,
      status: { $ne: 'tolangan' }
    });

    const totalDebt = unpaidPayments.reduce((sum, p) => sum + p.amount, 0);

    await sendNotification(
      player.fcmToken,
      'To\'lov eslatmasi ⏳',
      `Hurmatli ${player.firstName}, ${totalDebt.toLocaleString()} so\'m to\'lovingiz kutmoqda.`
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const checkOverduePayments = async () => {
  try {
    const now = new Date();

    await Payment.updateMany(
      { status: 'tolmagan', dueDate: { $lt: now } },
      { status: 'kechikkan' }
    );

    const overduePayments = await Payment.find({ status: 'kechikkan' })
      .populate('player', 'firstName lastName fcmToken')
      .populate('coach', 'fcmToken');

    for (const payment of overduePayments) {
      const daysDiff = Math.floor((now - payment.dueDate) / (1000 * 60 * 60 * 24));
      const notifyDays = [1, 3, 7, 14, 30];
      if (payment.player.fcmToken && notifyDays.includes(daysDiff)) {
        await sendNotification(
          payment.player.fcmToken,
          'To\'lov kechikdi! ❌',
          `${daysDiff} kun kechikdi. ${payment.amount.toLocaleString()} so\'m to\'lash kerak.`
        );
      }
    }
  } catch (error) {
    console.error('Kechikkan to\'lovlar tekshirishda xato:', error);
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ player: req.playerId })
      .sort({ year: -1, month: -1 });

    const totalDebt = payments
      .filter(p => p.status !== 'tolangan')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({ success: true, payments, totalDebt });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

const setFeeForAll = async (req, res) => {
  try {
    const { amount, month, year } = req.body;
    const coachId = req.coach._id;
    const m = getMsg(req.lang);
    const now = new Date();
    const mo = Number(month) || (now.getMonth() + 1);
    const y = Number(year) || now.getFullYear();
    const amt = Number(amount);

    if (!amt || amt <= 0) {
      return res.status(400).json({ message: m.amountRequired });
    }

    const players = await Player.find({ coach: coachId, isActive: true });
    if (!players.length) {
      return res.status(400).json({ message: m.noActivePlayers });
    }

    const dueDate = new Date(y, mo - 1, 5);

    const ops = players.map(p => ({
      updateOne: {
        filter: { player: p._id, month: mo, year: y, coach: coachId },
        update: {
          $set: { amount: amt, dueDate },
          $setOnInsert: { player: p._id, month: mo, year: y, coach: coachId, status: 'tolmagan' }
        },
        upsert: true
      }
    }));

    await Payment.bulkWrite(ops);
    await Coach.findByIdAndUpdate(coachId, { monthlyFee: amt });

    res.json({ success: true, count: players.length });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError, error: error.message });
  }
};

const getCoachPaymentInfo = async (req, res) => {
  try {
    const coach = await Coach.findById(req.coachId)
      .select('firstName lastName cardNumber whatsappNumber monthlyFee');
    if (!coach) return res.status(404).json({ message: getMsg(req.lang).coachNotFound });
    res.json({ success: true, coach });
  } catch (error) {
    res.status(500).json({ message: getMsg(req.lang).serverError });
  }
};

module.exports = {
  getPayments, setMonthlyFee, setFeeForAll, confirmPayment,
  makePayment, sendReminder, checkOverduePayments, getMyPayments, getCoachPaymentInfo
};
