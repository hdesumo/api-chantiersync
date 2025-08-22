// app.js — Chantiersync API (version conforme consolidée)
// - CORS multi-origines
// - Sécurité (helmet), logs (morgan), cookies, JSON parser
// - Health/debug: /status, /debug/ping, /debug/ping-auth, /debug/whoami
// - DB init (Sequelize authenticate si présent)
// - RBAC-ready: montage des routes métier + affiliation + admin affiliation
// - Compat rôle: mapping ADMIN -> PLATFORM_ADMIN via roleMap (optionnel)
// - Erreurs centralisées, 404, écoute 0.0.0.0
// ====================================================================

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

// ------------------------------
// CORS
// ------------------------------
const originsEnv = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '';
const allowedOrigins = originsEnv
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // allow curl / server-to-server
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
};
app.use(cors(corsOptions));

// ------------------------------
// Sécurité / parsers / logs
// ------------------------------
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ------------------------------
// Static (uploads optionnel)
// ------------------------------
try {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
} catch (_) {}

// ------------------------------
// DB (Sequelize) — non bloquant
// ------------------------------
try {
  const db = require('./models');
  if (db && db.sequelize && db.sequelize.authenticate) {
    db.sequelize.authenticate()
      .then(() => console.log('✅ DB connected'))
      .catch(err => console.error('❌ DB auth error:', err && err.message));
  }
} catch (e) {
  console.warn('⚠️ DB init skipped (./models not found or failed):', e.message);
}

// ------------------------------
// Auth & compat rôle (optionnel)
// ------------------------------
let authMiddleware;
try {
  ({ authMiddleware } = require('./middleware/auth'));
} catch (_) {
  // Fallback minimal pour dev: nécessite un Bearer et simule un STAFF
  authMiddleware = (req, res, next) => {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing Bearer token' });
    req.user = { id: 'demo', role: 'STAFF', enterprise_id: 'demo_ent' };
    next();
  };
}

let roleCompat; // mappe ADMIN -> PLATFORM_ADMIN si présent
try {
  roleCompat = require('./middleware/roleMap');
} catch (_) {
  roleCompat = null;
}

// Helper: auth + compat rôle pour routes debug/tests
const authWithCompat = (req, res, next) =>
  authMiddleware(req, res, () => (roleCompat ? roleCompat(req, res, next) : next()));

// ------------------------------
// Health & debug
// ------------------------------
app.get('/status', (_req, res) => {
  res.json({ status: 'API Chantiersync OK', timestamp: new Date().toISOString() });
});

const routerDebug = express.Router();
routerDebug.get('/ping', (_req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});
routerDebug.get('/ping-auth', authWithCompat, (req, res) => {
  res.json({ ok: true, auth: true, user: req.user || null });
});
routerDebug.get('/whoami', authWithCompat, (req, res) => {
  res.json({ user: req.user || null });
});
app.use('/debug', routerDebug);

// ------------------------------
// Safe mount helper
// ------------------------------
function safeMount(pathname, modulePath) {
  try {
    const router = require(modulePath);
    app.use(pathname, router);
    console.log(`➡️  Mounted ${modulePath} at ${pathname}`);
  } catch (e) {
    console.warn(`⚠️  Skipped ${modulePath} (${e.message})`);
  }
}

// ------------------------------
// API Routes (métier & affiliation)
// ------------------------------
// Existant
safeMount('/api', './routes/authRoutes');
safeMount('/api', './routes/siteRoutes');
safeMount('/api', './routes/reportRoutes');
// RBAC-ready (si fichiers présents)
safeMount('/api/tenants', './routes/tenantRoutes');
safeMount('/api/users', './routes/userRoutes');
safeMount('/api/media', './routes/mediaRoutes');
safeMount('/api/billing', './routes/billingRoutes');
// Admin affiliation (PLATFORM_ADMIN)
safeMount('/api', './routes/affiliateAdminRoutes');
// Programme d’affiliation public (liens/pixel)
safeMount('/', './routes/affiliateRoutes');

// -------- Accueil public (facultatif) --------
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir, { extensions: ['html'] }));

// Si quelqu’un visite la racine, renvoie /index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// ------------------------------
// 404 & Error handler
// ------------------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('💥 Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

// ------------------------------
// Start (écoute sur 0.0.0.0 pour compat PaaS)
// ------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API running on :${PORT}`);
});
