// app.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

/* ===========================
   CORS multi-origins (wildcards)
   =========================== */
const parseCsv = (s = '') => s.split(',').map(x => x.trim()).filter(Boolean);
const allowlist = parseCsv(process.env.CORS_ORIGIN || 'http://localhost:3000');

function isOriginAllowed(origin) {
  if (!origin) return true; // curl/SSR/outils
  return allowlist.some((pattern) => {
    if (pattern === '*') return true;
    if (pattern.startsWith('regex:')) {
      try { return new RegExp(pattern.slice(6)).test(origin); } catch { return false; }
    }
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(1); // ".vercel.app"
      return origin.endsWith(suffix);
    }
    return origin === pattern;
  });
}

const corsOptions = {
  origin: (origin, cb) => isOriginAllowed(origin) ? cb(null, true) : cb(null, false),
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept','X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => { res.setHeader('Vary', 'Origin'); next(); });
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* ===========================
   Parsers / logs / statiques
   =========================== */
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

/* ===========================
   DB init (Sequelize)
   =========================== */
const sequelize = require('./config/database');
(async () => {
  try {
    await sequelize.authenticate();
    // Sync via ./models si dispo, sinon fallback sequelize.sync()
    let synced = false;
    try {
      const db = require('./models');
      if (db?.sequelize?.sync) { await db.sequelize.sync(); synced = true; }
    } catch {}
    if (!synced) { await sequelize.sync(); }

    // Seed (optionnel)
    try {
      const { seedIfEmpty } = require('./seed');
      if (typeof seedIfEmpty === 'function') await seedIfEmpty();
    } catch {}
    // eslint-disable-next-line no-console
    console.log('✅ DB connected & synced');
  } catch (e) {
    console.error('❌ DB init error:', e.message);
  }
})();

/* ===========================
   Routes
   =========================== */
const authRoutes = require('./routes/authRoutes');
const siteRoutes = require('./routes/siteRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/reports', reportRoutes);

// Healthcheck pour Railway
app.get('/status', (_req, res) => res.sendStatus(204));

/* ===========================
   404 + handler global erreurs
   =========================== */
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, _next) => {
  const isProd = process.env.NODE_ENV === 'production';
  const status =
    err.status || err.statusCode ||
    (err.type === 'entity.parse.failed' ? 400 : 500);

  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  if (err && (err.code === 'LIMIT_FILE_SIZE' || err.name === 'MulterError')) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : 'Upload error';
    return res.status(413).json({ error: msg });
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (!isProd) {
    console.error('🧨', err);
    return res.status(status).json({ error: err.message || 'Internal error', stack: err.stack });
  }
  return res.status(status).json({ error: 'Internal error' });
});

/* ===========================
   Listen (0.0.0.0 pour Railway)
   =========================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 API running on :${PORT}`));

module.exports = app;

