// routes/affiliateAdminRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const ROLES = require('../middleware/roles');
const router = express.Router();

function getModelsOrSend(res, wanted = []) {
  try {
    const models = require('../models');
    if (!models) { res.status(500).json({ error: 'Sequelize models not available' }); return null; }
    for (const name of wanted) {
      if (!models[name]) { res.status(500).json({ error: `Sequelize model ${name} not found` }); return null; }
    }
    return models;
  } catch (e) {
    res.status(500).json({ error: `Models not available: ${e.message}` });
    return null;
  }
}

router.get('/affiliates', auth([ROLES.PLATFORM_ADMIN]), async (req, res) => {
  const models = getModelsOrSend(res, ['AffiliatePartner']); if (!models) return;
  const { AffiliatePartner } = models;
  try {
    const items = await AffiliatePartner.findAll({ order: [['id', 'DESC']] });
    res.json({ items });
  } catch (err) {
    console.error('GET /affiliates error:', err);
    res.status(500).json({ error: 'Failed to list affiliates' });
  }
});

router.get('/affiliate-links', auth([ROLES.PLATFORM_ADMIN]), async (req, res) => {
  const models = getModelsOrSend(res, ['AffiliateLink']); if (!models) return;
  const { AffiliateLink } = models;
  try {
    const items = await AffiliateLink.findAll({ order: [['id', 'DESC']] });
    res.json({ items });
  } catch (err) {
    console.error('GET /affiliate-links error:', err);
    res.status(500).json({ error: 'Failed to list affiliate links' });
  }
});

module.exports = router;

