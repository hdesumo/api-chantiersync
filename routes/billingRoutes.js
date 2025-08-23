// routes/billingRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const ROLES = require('../middleware/roles');
const router = express.Router();

router.get('/billing/licenses', auth([ROLES.PLATFORM_ADMIN]), async (_req, res) => {
  // Placeholder — à brancher sur votre système de licences
  res.json({ items: [] });
});

module.exports = router;

