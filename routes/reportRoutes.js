// routes/reportRoutes.js
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

const ROLES_READ  = [ROLES.PLATFORM_ADMIN, ROLES.TENANT_ADMIN, ROLES.MANAGER, ROLES.STAFF];
const ROLES_WRITE = [ROLES.TENANT_ADMIN, ROLES.MANAGER];

// Liste (scopée tenant sauf platform admin)
router.get('/reports', auth(ROLES_READ), async (req, res) => {
  const models = getModelsOrSend(res, ['Report']); if (!models) return;
  const { Report } = models;
  try {
    const where = (req.user?.role === ROLES.PLATFORM_ADMIN) ? {} : { enterprise_id: req.user?.enterprise_id || null };
    const items = await Report.findAll({ where, order: [['id', 'DESC']] });
    res.json({ items });
  } catch (err) {
    console.error('GET /reports error:', err);
    res.status(500).json({ error: 'Failed to list reports' });
  }
});

// Création (tenants)
router.post('/reports', auth(ROLES_WRITE), async (req, res) => {
  const models = getModelsOrSend(res, ['Report']); if (!models) return;
  const { Report } = models;
  try {
    const { site_id, title, content } = req.body || {};
    if (!site_id || !title) return res.status(400).json({ error: 'site_id and title are required' });
    const created = await Report.create({
      site_id,
      title: String(title).trim(),
      content: content || null,
      enterprise_id: req.user?.enterprise_id || null,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /reports error:', err);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

module.exports = router;

