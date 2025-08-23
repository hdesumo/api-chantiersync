// routes/tenantRoutes.js
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

router.get('/tenants', auth([ROLES.PLATFORM_ADMIN]), async (req, res) => {
  const models = getModelsOrSend(res, ['Tenant']); if (!models) return;
  const { Tenant } = models;
  try {
    const items = await Tenant.findAll({ order: [['id', 'DESC']] });
    res.json({ items });
  } catch (err) {
    console.error('GET /tenants error:', err);
    res.status(500).json({ error: 'Failed to list tenants' });
  }
});

router.post('/tenants', auth([ROLES.PLATFORM_ADMIN]), async (req, res) => {
  const models = getModelsOrSend(res, ['Tenant']); if (!models) return;
  const { Tenant } = models;
  try {
    const { name, domain } = req.body || {};
    if (!name || !String(name).trim()) return res.status(400).json({ error: 'name is required' });
    const created = await Tenant.create({
      name: String(name).trim(),
      domain: domain ? String(domain).trim() : null,
      suspended: false,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /tenants error:', err);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

router.get('/tenants/:id', auth([ROLES.PLATFORM_ADMIN]), async (req, res) => {
  const models = getModelsOrSend(res, ['Tenant']); if (!models) return;
  const { Tenant } = models;
  try {
    const t = await Tenant.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Tenant not found' });
    res.json(t);
  } catch (err) {
    console.error('GET /tenants/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

router.patch('/tenants/:id', auth([ROLES.PLATFORM_ADMIN]), async (req, res) => {
  const models = getModelsOrSend(res, ['Tenant']); if (!models) return;
  const { Tenant } = models;
  try {
    const t = await Tenant.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Tenant not found' });
    if (typeof req.body?.suspended !== 'undefined') t.suspended = !!req.body.suspended;
    if (typeof req.body?.name === 'string') t.name = req.body.name.trim();
    if (typeof req.body?.domain !== 'undefined') t.domain = req.body.domain ? String(req.body.domain).trim() : null;
    await t.save();
    res.json(t);
  } catch (err) {
    console.error('PATCH /tenants/:id error:', err);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

router.delete('/tenants/:id', auth([ROLES.PLATFORM_ADMIN]), async (req, res) => {
  const models = getModelsOrSend(res, ['Tenant']); if (!models) return;
  const { Tenant } = models;
  try {
    const t = await Tenant.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Tenant not found' });
    await t.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /tenants/:id error:', err);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

module.exports = router;

