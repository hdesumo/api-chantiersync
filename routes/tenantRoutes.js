// routes/tenantRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Helper pour charger les modèles sans faire planter le require au montage
function getModelsOrError(res) {
  try {
    // eslint-disable-next-line global-require
    const models = require('../models');
    if (!models || !models.Tenant) {
      res.status(500).json({ error: 'Sequelize model Tenant not found' });
      return null;
    }
    return models;
  } catch (e) {
    res.status(500).json({ error: `Models not available: ${e.message}` });
    return null;
  }
}

function asJsonList(rows) {
  return { items: rows || [] };
}

// GET /api/tenants (PLATFORM_ADMIN)
router.get('/tenants', auth(['PLATFORM_ADMIN']), async (req, res) => {
  const models = getModelsOrError(res); if (!models) return;
  const { Tenant } = models;
  try {
    const order = [['createdAt', 'DESC']];
    let items = await Tenant.findAll({ order });
    if (!items?.length) {
      // fallback si pas de createdAt
      items = await Tenant.findAll({ order: [['id', 'DESC']] });
    }
    res.json(asJsonList(items));
  } catch (err) {
    console.error('GET /tenants error:', err);
    res.status(500).json({ error: 'Failed to list tenants' });
  }
});

// POST /api/tenants (PLATFORM_ADMIN)
router.post('/tenants', auth(['PLATFORM_ADMIN']), async (req, res) => {
  const models = getModelsOrError(res); if (!models) return;
  const { Tenant } = models;
  try {
    const { name, domain } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const created = await Tenant.create({
      name: String(name).trim(),
      domain: domain ? String(domain).trim() : null,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /tenants error:', err);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// PATCH /api/tenants/:id (suspend/unsuspend)
router.patch('/tenants/:id', auth(['PLATFORM_ADMIN']), async (req, res) => {
  const models = getModelsOrError(res); if (!models) return;
  const { Tenant } = models;
  try {
    const { suspended } = req.body || {};
    if (typeof suspended === 'undefined') {
      return res.status(400).json({ error: 'suspended is required (boolean)' });
    }
    const t = await Tenant.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Tenant not found' });
    t.suspended = !!suspended;
    await t.save();
    res.json(t);
  } catch (err) {
    console.error('PATCH /tenants/:id error:', err);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

module.exports = router;

