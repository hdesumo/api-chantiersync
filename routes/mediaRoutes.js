// routes/mediaRoutes.js
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

const ROLES_READ = [ROLES.PLATFORM_ADMIN, ROLES.TENANT_ADMIN, ROLES.MANAGER, ROLES.STAFF];

router.get('/media', auth(ROLES_READ), async (req, res) => {
  const models = getModelsOrSend(res, ['Media']); if (!models) return;
  const { Media } = models;
  try {
    const where = (req.user?.role === ROLES.PLATFORM_ADMIN) ? {} : { enterprise_id: req.user?.enterprise_id || null };
    const items = await Media.findAll({ where, order: [['id', 'DESC']] });
    res.json({ items });
  } catch (err) {
    console.error('GET /media error:', err);
    res.status(500).json({ error: 'Failed to list media' });
  }
});

module.exports = router;

