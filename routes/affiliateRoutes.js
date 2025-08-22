// routes/affiliateRoutes.js
const express = require('express');
const router = express.Router();

// Uses our attribution middleware (no hard config needed)
let captureLead = (_req, _res, next) => next();
try {
  ({ captureLead } = require('../middleware/attribution'));
} catch (_) {
  // still works without it
}

// GET /aff/r/:code  → set cookie/lead then redirect to signup (or ?target=)
router.get('/aff/r/:code', (req, res) => {
  // Surface the code as query.aff so captureLead can read it
  req.query = { ...(req.query || {}), aff: req.params.code };

  captureLead(req, res, () => {
    const target = req.query.target || process.env.AFF_REDIRECT || '/auth/register';
    // Basic safety: ensure relative path if you accidentally pass an empty string
    const safeTarget = String(target || '/auth/register');
    res.redirect(safeTarget);
  });
});

// GET /aff/pixel.gif?aff=CODE&campaign=...&source=...
router.get('/aff/pixel.gif', captureLead, (_req, res) => {
  const buf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64'); // 1x1 GIF
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-store');
  res.end(buf);
});

module.exports = router;

