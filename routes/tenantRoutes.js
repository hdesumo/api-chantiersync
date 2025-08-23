// routes/tenantRoutes.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth'); // ton middleware JWT + rôles
const { Tenant } = require('../models');    // Sequelize model "Tenant"

/**
 * Helpers
 */
function asJsonList(rows) {
  // On retourne { items: [...] } pour être stable côté front
  return { items: rows || [] };
}

/**
 * GET /api/tenants
 * Liste des tenants (plateforme) — rôle: PLATFORM_ADMIN
 */
router.get('/tenants', auth(['PLATFORM_ADMIN']), async (req, res) => {
  try {
    const order = [['createdAt', 'DESC']];
    const items = await Tenant.findAll({ order }).catch(async () => {
      // fallback si createdAt n'existe pas
      return Tenant.findAll({ order: [['id', 'DESC']] });
    });
    res.json(asJsonList(items));
  } catch (err) {
    console.error('GET /tenants error:', err);
    res.status(500).json({ error: 'Failed to list tenants' });
  }
});

/**
 * POST /api/tenants
 * Créer un tenant — rôle: PLATFORM_ADMIN
 * Body: { name, domain? }
 */
router.post('/tenants', auth(['PLATFORM_ADMIN']), async (req, res) => {
  try {
    const { name, domain } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const payload = {
      name: String(name).trim(),
      domain: domain ? String(domain).trim() : null,
    };
    const created = await Tenant.create(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /tenants error:', err);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

/**
 * GET /api/tenants/:id
 * Détail — rôle: PLATFORM_ADMIN
 */
router.get('/tenants/:id', auth(['PLATFORM_ADMIN']), async (req, res) => {
  try {
    const t = await Tenant.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Tenant not found' });
    res.json(t);
  } catch (err) {
    console.error('GET /tenants/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

/**
 * PATCH /api/tenants/:id
 * Suspension / réactivation — rôle: PLATFORM_ADMIN
 * Body: { suspended: boolean }
 */
router.patch('/tenants/:id', auth(['PLATFORM_ADMIN']), async (req, res) => {
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

/**
 * DELETE /api/tenants/:id
 * Optionnel — suppression logique ou hard delete si souhaité
 */
router.delete('/tenants/:id', auth(['PLATFORM_ADMIN']), async (req, res) => {
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

