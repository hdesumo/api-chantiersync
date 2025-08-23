// routes/siteRoutes.js
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

function scopeByEnterprise(req) {
  if (req.user?.role === ROLES.PLATFORM_ADMIN) return {};
  return { enterprise_id: req.user?.enterprise_id || null };
}

router.get('/sites', auth(ROLES_READ), async (req, res) => {
  const models = getModelsOrSend(res, ['Site']); if (!models) return;
  const { Site, Sequelize } = models;
  const { Op } = Sequelize || require('sequelize');
  try {
    const { q = '', page = 1, limit = 50 } = req.query;
    const where = scopeByEnterprise(req);
    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { city: { [Op.iLike]: `%${q}%` } },
        { address: { [Op.iLike]: `%${q}%` } },
      ];
    }
    const order = [['id', 'DESC']];
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Site.findAndCountAll({
      where, order, limit: Number(limit), offset: Math.max(0, offset),
    });
    res.json({ items: rows, total: count });
  } catch (err) {
    console.error('GET /sites error:', err);
    res.status(500).json({ error: 'Failed to list sites' });
  }
});

router.post('/sites', auth(ROLES_WRITE), async (req, res) => {
  const models = getModelsOrSend(res, ['Site']); if (!models) return;
  const { Site } = models;
  try {
    const { name, address, city, country } = req.body || {};
    if (!name || !String(name).trim()) return res.status(400).json({ error: 'name is required' });
    const payload = {
      name: String(name).trim(),
      address: address ? String(address).trim() : null,
      city: city ? String(city).trim() : null,
      country: country ? String(country).trim() : null,
      enterprise_id: req.user?.enterprise_id || null,
    };
    const created = await Site.create(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /sites error:', err);
    res.status(500).json({ error: 'Failed to create site' });
  }
});

router.get('/sites/:id', auth(ROLES_READ), async (req, res) => {
  const models = getModelsOrSend(res, ['Site']); if (!models) return;
  const { Site } = models;
  try {
    const where = { id: req.params.id, ...scopeByEnterprise(req) };
    const s = await Site.findOne({ where });
    if (!s) return res.status(404).json({ error: 'Site not found' });
    res.json(s);
  } catch (err) {
    console.error('GET /sites/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch site' });
  }
});

router.patch('/sites/:id', auth(ROLES_WRITE), async (req, res) => {
  const models = getModelsOrSend(res, ['Site']); if (!models) return;
  const { Site } = models;
  try {
    const where = { id: req.params.id, ...scopeByEnterprise(req) };
    const s = await Site.findOne({ where });
    if (!s) return res.status(404).json({ error: 'Site not found' });

    const { name, address, city, country } = req.body || {};
    if (typeof name === 'string') s.name = name.trim();
    if (address !== undefined) s.address = address ? String(address).trim() : null;
    if (city !== undefined) s.city = city ? String(city).trim() : null;
    if (country !== undefined) s.country = country ? String(country).trim() : null;

    await s.save();
    res.json(s);
  } catch (err) {
    console.error('PATCH /sites/:id error:', err);
    res.status(500).json({ error: 'Failed to update site' });
  }
});

router.delete('/sites/:id', auth(ROLES_WRITE), async (req, res) => {
  const models = getModelsOrSend(res, ['Site']); if (!models) return;
  const { Site } = models;
  try {
    const where = { id: req.params.id, ...scopeByEnterprise(req) };
    const s = await Site.findOne({ where });
    if (!s) return res.status(404).json({ error: 'Site not found' });
    await s.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /sites/:id error:', err);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

module.exports = router;

