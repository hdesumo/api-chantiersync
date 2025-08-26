const express = require('express');
const router = express.Router();
const { Site } = require('../models');   // Assure-toi que ton modèle existe
const auth = require('../middleware/auth');
const ROLES = require('../middleware/roles');

// GET /api/sites → Liste de tous les sites
router.get(
  '/',
  auth([ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN, ROLES.TENANT_ADMIN, ROLES.MANAGER]),
  async (req, res) => {
    try {
      const sites = await Site.findAll();
      res.json(sites); // ✅ Toujours une réponse
    } catch (err) {
      console.error('Error fetching sites:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/sites/:id → Détails d’un site
router.get(
  '/:id',
  auth([ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN, ROLES.TENANT_ADMIN, ROLES.MANAGER]),
  async (req, res) => {
    try {
      const site = await Site.findByPk(req.params.id);
      if (!site) return res.status(404).json({ error: 'Site not found' });
      res.json(site);
    } catch (err) {
      console.error('Error fetching site:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/sites → Créer un site
router.post(
  '/',
  auth([ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN, ROLES.TENANT_ADMIN]),
  async (req, res) => {
    try {
      const site = await Site.create(req.body);
      res.status(201).json(site);
    } catch (err) {
      console.error('Error creating site:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// PUT /api/sites/:id → Modifier un site
router.put(
  '/:id',
  auth([ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN, ROLES.TENANT_ADMIN]),
  async (req, res) => {
    try {
      const site = await Site.findByPk(req.params.id);
      if (!site) return res.status(404).json({ error: 'Site not found' });

      await site.update(req.body);
      res.json(site);
    } catch (err) {
      console.error('Error updating site:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// DELETE /api/sites/:id → Supprimer un site
router.delete(
  '/:id',
  auth([ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN]),
  async (req, res) => {
    try {
      const site = await Site.findByPk(req.params.id);
      if (!site) return res.status(404).json({ error: 'Site not found' });

      await site.destroy();
      res.json({ message: 'Site deleted' });
    } catch (err) {
      console.error('Error deleting site:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;

