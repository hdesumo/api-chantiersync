const express = require('express');
const router = express.Router();
const { Site } = require('../models');
const auth = require('../middleware/auth');
const ROLES = require('../middleware/roles');

// GET /api/sites
router.get('/', auth([ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN, ROLES.TENANT_ADMIN]), async (req, res) => {
  try {
    const sites = await Site.findAll();
    res.json(sites); // ✅ toujours renvoyer une réponse
  } catch (err) {
    console.error('Error fetching sites:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

