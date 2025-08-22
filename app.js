// app.js
'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1); // derrière Railway/Proxies

// ---------- Healthchecks (sans DB) ----------
app.head('/', (_req, res) => res.status(204).end());
app.head('/status', (_req, res) => res.status(204).end());

// ---------- Sécurité (Helmet + Rate limit) ----------
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // API only, autorise CORS pour /uploads
}));

const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  limit: 300,           // 300 req/min/IP (ajuste au besoin)
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => (
    req.method === 'OPTIONS' || // ne pas limiter les preflight CORS
    req.method === 'HEAD' ||    // ne pas limiter les health
    req.path === '/' ||
    req.path === '/status'
  ),
});
app.use(limiter);

// ---------- CORS ----------
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    // Autorise curl/Postman sans Origin
    if (!origin) return cb(null, true);
    return cb(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // prévol global

// ---------- Parsers & logs ----------
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

// ---------- Uploads statiques ----------
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }); } catch (e) {
  console.warn('Warning: unable to ensure UPLOAD_DIR exists:', e?.message);
}
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR), {
  maxAge: '1d',
  etag: true,
}));

// ---------- DB & Models ----------
const models = require('./models'); // doit exposer { sequelize, Site, Report, ... }
const { sequelize, Site, Report } = models;

// ---------- Auth middleware (résolution robuste) ----------
let authMw = null;
try {
  const mod = require('./middleware/auth');
  authMw = (typeof mod === 'function') ? mod : mod?.authMiddleware;
} catch (_) {
  authMw = null;
}
const requireAuth = (req, res, next) => {
  if (typeof authMw === 'function') return authMw(req, res, next);
  return res.status(500).json({ error: 'Auth middleware not loaded' });
};

// ---------- Debug ----------
const routerDebug = express.Router();

routerDebug.get('/ping', (_req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

routerDebug.get('/ping-auth', requireAuth, (_req, res) => {
  res.json({ ok: true, auth: true });
});

routerDebug.get('/db', async (_req, res) => {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query('SELECT 1 AS x');
    res.json({ db: 'ok', x: rows?.[0]?.x ?? 1 });
  } catch (e) {
    console.error('debug/db error:', e);
    res.status(500).json({ db: 'error', message: e?.message || 'db error' });
  }
});

routerDebug.get('/sites-count', async (_req, res) => {
  try {
    const count = Site ? await Site.count() : 0;
    res.json({ count });
  } catch (e) {
    console.error('debug/sites-count error:', e);
    res.status(500).json({ error: 'count failed' });
  }
});

routerDebug.get('/reports-count', async (_req, res) => {
  try {
    const count = Report ? await Report.count() : 0;
    res.json({ count });
  } catch (e) {
    console.error('debug/reports-count error:', e);
    res.status(500).json({ error: 'count failed' });
  }
});

// Liste des routes montées (diagnostic)
routerDebug.get('/routes', (req, res) => {
  const out = [];
  const stack = req.app?._router?.stack || [];
  stack.forEach((layer) => {
    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods || {}).join(',');
      out.push({ path, methods });
    } else if (layer.name === 'router' && layer.handle?.stack) {
      const base = layer.regexp?.source
        ?.replace('^\\', '/')
        ?.replace('\\/?(?=\\/|$)', '')
        ?.replace('^', '')
        ?.replace('$', '') || '';
      layer.handle.stack.forEach((s) => {
        if (s.route) {
          const p = s.route.path;
          const m = Object.keys(s.route.methods || {}).join(',');
          out.push({ path: (base || '') + p, methods: m });
        }
      });
    }
  });
  res.json(out);
});

app.use('/debug', routerDebug);

// ---------- Routes métier ----------
const authRoutes   = require('./routes/authRoutes');    // POST /api/auth/login
const siteRoutes   = require('./routes/siteRoutes');    // GET/POST/PATCH /api/sites, GET /api/sites/:id/qr.png, /api/sites-probe
const reportRoutes = require('./routes/reportRoutes');  // GET /api/reports, DELETE attachments, etc.

app.use('/api', authRoutes);
app.use('/api', siteRoutes);
app.use('/api', reportRoutes);

// ---------- 404 ----------
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

// ---------- Error handler ----------
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ status: 'error', message: 'internal server error' });
});

// ---------- Start ----------
const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log(`🚀 API running on :${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected & authenticated');
  } catch (e) {
    console.error('❌ DB connection error:', e?.message);
  }
});

module.exports = app;

