// app.js
'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// DB & models
const sequelize = require('./config/database');
let Models = {};
try {
  Models = require('./models'); // { Site, Report, ... } si présent
} catch (_) { /* ok si pas d’index */ }

// Routes métier
const authRoutes = require('./routes/authRoutes');
const siteRoutes = require('./routes/siteRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

/* ============ Middleware de base ============ */
app.disable('x-powered-by');
app.set('trust proxy', true);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS multi-origines (liste séparée par des virgules dans CORS_ORIGIN)
const allowed = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true);                    // clients non-browsers / cURL
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error('CORS not allowed from ' + origin));
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
}));

// Réponse timeout (25s) pour éviter les pendings
app.use((req, res, next) => {
  res.setTimeout(25_000, () => {
    if (!res.headersSent) res.status(504).json({ error: 'timeout' });
  });
  next();
});

// (Option) morgan si installé
try { app.use(require('morgan')('tiny')); } catch (_) {}

/* ============ Healthchecks ============ */
// 204 No Content sur HEAD /
app.head('/', (_req, res) => res.status(204).end());
// 204 No Content sur HEAD /status
app.head('/status', (_req, res) => res.status(204).end());

/* ============ DEBUG endpoints (faciles à retirer ensuite) ============ */
function bearer(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    const m = h.match(/^Bearer\s+(.+)$/i);
    if (!m) return res.status(401).json({ error: 'Missing token' });
    req.user = jwt.verify(m[1], process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ping non-auth
app.get('/debug/ping', (_req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

// ping + auth inline
app.get('/debug/ping-auth', bearer, (_req, res) => {
  res.json({ ok: true, auth: true });
});

// ping DB
app.get('/debug/db', async (_req, res, next) => {
  try {
    await sequelize.query('SELECT 1');
    res.json({ db: 'ok' });
  } catch (e) { next(e); }
});

// counts (légers)
app.get('/debug/sites-count', async (_req, res, next) => {
  try {
    const n = (Models.Site && Models.Site.count) ? await Models.Site.count() : 0;
    res.json({ count: n });
  } catch (e) { next(e); }
});

app.get('/debug/reports-count', async (_req, res, next) => {
  try {
    const n = (Models.Report && Models.Report.count) ? await Models.Report.count() : 0;
    res.json({ count: n });
  } catch (e) { next(e); }
});

/* ============ Routes API ============ */
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/reports', reportRoutes);

// 404 (facultatif)
app.use((req, res, _next) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return res.status(404).json({ error: 'Not Found' });
  }
  return res.status(404).end();
});

// Handler global d’erreurs
app.use((err, req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error('🔥', err);
  if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
});

/* ============ Démarrage + init DB (non bloquant) ============ */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 API running on :${PORT}`);
});

// Connexion DB en arrière-plan (sans bloquer les healthchecks)
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    // eslint-disable-next-line no-console
    console.log('✅ DB connected & synced');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('❌ DB init error:', e.message);
  }
})();

module.exports = app;

