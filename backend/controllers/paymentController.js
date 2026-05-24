const Payment = require('../models/Payment');
const Player = require('../models/Player');
const { sendNotification } = require('./notificationController');

// Barcha to'lovlarni olish (trener uchun)
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

    // Statistika
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
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Oylik to'lov summasi belgilash / yangilash
const setMonthlyFee = async (req, res) => {
  try {
    const { playerId, amount, month, year, dueDay = 5 } = req.body;

    const player = await Player.findOne({ _id: playerId, coach: req.coach._id });
    if (!player) {
      return res.status(404).json({ message: 'Futbolchi topilmadi.' });
    }

    const dueDate = new Date(year, month - 1, dueDay);

    const payment = await Payment.findOneAndUpdate(
      { player: playerId, month, year, coach: req.coach._id },
      { amount, dueDate, status: 'tolmagan', coach: req.coach._id, player: playerId, month, year },
      { upsert: true, new: true }
    );

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// To'lovni tasdiqlash (trener tomonidan)
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
      return res.status(404).json({ message: 'To\'lov topilmadi.' });
    }

    // Futbolchiga bildirishnoma
    if (payment.player.fcmToken) {
      await sendNotification(
        payment.player.fcmToken,
        'To\'lov tasdiqlandi ✅',
        `${payment.amount.toLocaleString()} so\'m to\'lovingiz tasdiqlandi.`
      );
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Futbolchi to'lov qilishi (app orqali)
const makePayment = async (req, res) => {
  try {
    const { paymentId, paymentMethod, transactionId } = req.body;

    const payment = await Payment.findOne({
      _id: paymentId,
      player: req.playerId
    }).populate('coach', 'firstName lastName fcmToken');

    if (!payment) {
      return res.status(404).json({ message: 'To\'lov topilmadi.' });
    }

    payment.status = 'tolangan';
    payment.paidDate = new Date();
    payment.paymentMethod = paymentMethod;
    payment.transactionId = transactionId;
    await payment.save();

    // Trenerga bildirishnoma
    const player = await Player.findById(req.playerId);
    if (payment.coach.fcmToken && player) {
      await sendNotification(
        payment.coach.fcmToken,
        'To\'lov keldi 💰',
        `${player.firstName} ${player.lastName} — ${payment.amount.toLocaleString()} so'm to\'ladi.`
      );
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Futbolchiga eslatma yuborish
const sendReminder = async (req, res) => {
  try {
    const { playerId } = req.body;

    const player = await Player.findOne({ _id: playerId, coach: req.coach._id });
    if (!player || !player.fcmToken) {
      return res.status(404).json({ message: 'Futbolchi topilmadi yoki token yo\'q.' });
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

    res.json({ success: true, message: 'Eslatma yuborildi.' });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// Kechikkan to'lovlarni avtomatik tekshirish (cron job)
const checkOverduePayments = async () => {
  try {
    const now = new Date();

    await Payment.updateMany(
      { status: 'tolmagan', dueDate: { $lt: now } },
      { status: 'kechikkan' }
    );

    // Kechikkan futbolchilarga bildirishnoma
    const overduePayments = await Payment.find({ status: 'kechikkan' })
      .populate('player', 'firstName lastName fcmToken')
      .populate('coach', 'fcmToken');

    for (const payment of overduePayments) {
      const daysDiff = Math.floor((now - payment.dueDate) / (1000 * 60 * 60 * 24));
      // Faqat 1, 3, 7, 14, 30 kunlarda bildirishnoma yuborish (spam oldini olish)
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

// Futbolchi o'z to'lovlarini ko'rish
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ player: req.playerId })
      .sort({ year: -1, month: -1 });

    const totalDebt = payments
      .filter(p => p.status !== 'tolangan')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({ success: true, payments, totalDebt });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

module.exports = {
  getPayments, setMonthlyFee, confirmPayment,
  makePayment, sendReminder, checkOverduePayments, getMyPayments
};
