// app.js — Chantiersync API (version conforme consolidée)
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
console.log(`➡️ Mounted ${modulePath} at ${pathname}`);
} catch (e) {
console.warn(`⚠️ Skipped ${modulePath} (${e.message})`);
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
