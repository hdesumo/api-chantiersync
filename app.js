// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// License CRON
require("./jobs/licenseCron");

const authMiddleware = require('./middleware/auth');
const licenseRoutes = require("./routes/licenseRoutes");
const enterpriseRoutes = require("./routes/enterpriseRoutes");

const app = express();

// Middlewares globaux
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- ROUTES ---
// Publiques
app.use('/api', require('./routes/authRoutes')); // login/register
app.use("/api/licenses", licenseRoutes);
app.use("/api/enterprises", enterpriseRoutes);

// Protégées (JWT obligatoire)
app.use('/api/sites', authMiddleware, require('./routes/siteRoutes'));
app.use('/api/reports', authMiddleware, require('./routes/reportRoutes'));
app.use('/api/tenants', authMiddleware, require('./routes/tenantRoutes'));
app.use('/api/users', authMiddleware, require('./routes/userRoutes'));
app.use('/api/media', authMiddleware, require('./routes/mediaRoutes'));
app.use('/api/billing', authMiddleware, require('./routes/billingRoutes'));
app.use('/api/affiliate-admin', authMiddleware, require('./routes/affiliateAdminRoutes'));

// Si certaines routes sont publiques
app.use('/', require('./routes/affiliateRoutes'));

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// Lancement du serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ DB connected`); // DB init devrait être loguée ailleurs
  console.log(`🚀 API running on :${PORT}`);
});

