// routes/debugRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

router.get('/ping', (_req, res) => res.json({ ok: true, now: new Date().toISOString() }));
router.get('/ping-auth', authMiddleware, (_req, res) => res.json({ ok: true, auth: true }));

// Liste des routes enregistrées (utile pour vérifier les montages)
router.get('/routes', (req, res) => {
  const out = [];
  const stack = req.app?._router?.stack || [];
  stack.forEach((layer) => {
    if (layer.route) {
      const path = layer.route?.path;
      const methods = Object.keys(layer.route.methods || {}).join(',');
      out.push({ path, methods });
    } else if (layer.name === 'router' && layer.handle?.stack) {
      const base = layer.regexp?.source
        .replace('^\\', '/')
        .replace('\\/?(?=\\/|$)', '')
        .replace('^', '')
        .replace('$', '');
      layer.handle.stack.forEach((s) => {
        const p = s.route?.path;
        const m = s.route ? Object.keys(s.route.methods || {}).join(',') : '';
        if (p) out.push({ path: (base || '') + p, methods: m });
      });
    }
  });
  res.json(out);
});

module.exports = router;

