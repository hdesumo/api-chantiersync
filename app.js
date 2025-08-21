// app.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// ---- App & base config
const app = express();
app.set('trust proxy', 1); // Railway/Proxies

// ---- Healthchecks 204 (sans dépendance DB)
app.head('/', (_req, res) => res.status(204).end());
app.head('/status', (_req, res) => res.status(204).end());

// ---- CORS (liste depuis CORS_ORIGIN, séparée par des virgules)
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    // Autorise outils CLI (curl/postman) sans Origin
    if (!origin) return cb(null, true);
    return cb(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // prévol en cache 24h
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // prévol global

// ---- Parsers & logs
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

// ---- Uploads statiques (si nécessaire pour pièces jointes)
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (e) {
  console.warn('Warning: unable to ensure UPLOAD_DIR exists:', e?.message);
}
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR), {
  maxAge: '1d',
  etag: true,
}));

// ---- DB & Models
// On importe après les parsers pour éviter les cycles surprenants
const models = require('./models'); // doit exposer { sequelize, Site, Report, ... }
const { sequelize, Site, Report } = models;

// ---- Middleware d'auth (JWT)
const { authMiddleware } = require('./middleware/auth');

// ---- Debug endpoints
const routerDebug = express.Router();

// Ping simple
routerDebug.get('/ping', (_req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

// Ping + auth
routerDebug.get('/ping-auth', authMiddleware, (_req, res) => {
  res.json({ ok: true, auth: true });
});

// Ping DB (SELECT 1)
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

// Compteurs Sites/Rapports
routerDebug.get('/sites-count', async (_req, res) => {
  try {
    const count = await Site.count();
    res.json({ count });
  } catch (e) {
    console.error('debug/sites-count error:', e);
    res.status(500).json({ error: 'count failed' });
  }
});

routerDebug.get('/reports-count', async (_req, res) => {
  try {
    const count = await Report.count();
    res.json({ count });
  } catch (e) {
    console.error('debug/reports-count error:', e);
    res.status(500).json({ error: 'count failed' });
  }
});

// Liste toutes les routes (utile pour vérifier le montage)
routerDebug.get('/routes', (req, res) => {
  const out = [];
  const stack = req.app?._router?.stack || [];
  stack.forEach((layer) => {
    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods || {}).join(',');
      out.push({ path, methods });
    } else if (layer.name === 'router' && layer.handle?.stack) {
      // reconstitue un préfixe approximatif
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

// ---- Routes métier (déjà présentes dans le projet)
const authRoutes   = require('./routes/authRoutes');    // POST /api/auth/login
const siteRoutes   = require('./routes/siteRoutes');    // GET /api/sites, GET /api/sites/:id/qr.png
const reportRoutes = require('./routes/reportRoutes');  // GET /api/reports, DELETE /api/reports/:reportId/attachments/:fileName

app.use('/api', authRoutes);
app.use('/api', siteRoutes);
app.use('/api', reportRoutes);

// ---- 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ---- Error handler (évite 502 edge en cas d’exception non gérée)
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ status: 'error', message: 'internal server error' });
});

// ---- Lancement serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log(`🚀 API running on :${PORT}`);

  // Log DB à l’arrivée pour confirmer la connexion
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected & authenticated');
  } catch (e) {
    console.error('❌ DB connection error:', e?.message);
  }
});

module.exports = app;

