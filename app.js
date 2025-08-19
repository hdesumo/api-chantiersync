// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
const { seedIfEmpty } = require('./seed');
const authRoutes = require('./routes/authRoutes');
const siteRoutes = require('./routes/siteRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

app.get('/status', (_, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;
(async () => {
  await sequelize.authenticate();
  await require('./models').syncAll(); // crée les tables si absentes
  await seedIfEmpty();
  app.listen(PORT, () => console.log(`🚀 API running on :${PORT}`));
})();

