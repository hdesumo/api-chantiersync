// app.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require("path");
const fs = require("fs");
const companyRoutes = require("./routes/companyRoutes");

const app = express();
const PORT = process.env.PORT || 8080;

// s'assurer que le dossier upload existe
fs.mkdirSync(path.join(process.cwd(), "uploads/logos"), { recursive: true });

/* ----------------------------- Core middlewares ---------------------------- */
const origins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    // autorise les outils (curl, health) sans origin
    if (!origin) return cb(null, true);
    if (!origins.length || origins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
};

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(companyRoutes);

/* ------------------------------- Rate limiting ----------------------------- */
// On protège les routes API, mais on laisse / et /status libres
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/status') return next();
  return apiLimiter(req, res, next);
});

/* --------------------------------- Health --------------------------------- */
app.get('/', (req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

app.get('/status', (req, res) => {
  res.json({ status: 'API Chantiersync OK', timestamp: new Date().toISOString() });
});

/* --------------------------------- Mounts --------------------------------- */
function safeMount(base, relPath) {
  try {
    const r = require(relPath);
    app.use(base, r);
    console.log(`➡️  Mounted ${relPath} at ${base}`);
  } catch (e) {
    console.warn(`⚠️  Skipped ${relPath} (${e.message})`);
  }
}

// Toutes les routes “métier” sous /api
safeMount('/api', './routes/authRoutes');
safeMount('/api', './routes/siteRoutes');
safeMount('/api', './routes/reportRoutes');
safeMount('/api', './routes/tenantRoutes');
safeMount('/api', './routes/userRoutes');
safeMount('/api', './routes/mediaRoutes');
safeMount('/api', './routes/billingRoutes');
safeMount('/api', './routes/affiliateAdminRoutes');

// Les routes publiques d’affiliation à la racine si présentes
safeMount('/', './routes/affiliateRoutes');

/* -------------------------------- 404/Errors ------------------------------- */
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

/* ------------------------------- DB + start -------------------------------- */
(async () => {
  try {
    const models = require('./models'); // Sequelize index.js
    if (models?.sequelize?.authenticate) {
      await models.sequelize.authenticate();
      console.log('✅ DB connected');
    } else {
      console.log('⚠️  Sequelize not detected, skipping DB check');
    }
  } catch (e) {
    console.warn('⚠️  DB connection failed:', e.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 API running on :${PORT}`);
  });
})();

module.exports = app;

