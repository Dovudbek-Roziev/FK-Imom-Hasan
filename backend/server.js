const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

dotenv.config();

// uploads papkasini yaratish (mavjud bo'lmasa)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (foto yuklash uchun)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/players', require('./routes/players'));
app.use('/api/trainings', require('./routes/trainings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teams', require('./routes/teams'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Imom Hasan FK API ishlayapti!', status: 'ok' });
});

// MongoDB ulanish
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB ulandi'))
  .catch(err => console.error('MongoDB xatosi:', err));

// Har kuni soat 09:00 da to'lov kechikishini tekshirish
cron.schedule('0 9 * * *', async () => {
  const paymentController = require('./controllers/paymentController');
  await paymentController.checkOverduePayments();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishlamoqda`);
});
