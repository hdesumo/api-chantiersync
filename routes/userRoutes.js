// routes/userRoutes.js
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

// Vue globale plateforme
router.get('/users', auth([ROLES.PLATFORM_ADMIN]), async (req, res) => {
  const models = getModelsOrSend(res, ['User']); if (!models) return;
  const { User, Sequelize } = models;
  const { Op } = Sequelize || require('sequelize');
  try {
    const { q = '', page = 1, limit = 50 } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${q}%` } },
        { name: { [Op.iLike]: `%${q}%` } },
      ];
    }
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await User.findAndCountAll({
      where, order: [['id', 'DESC']], limit: Number(limit), offset: Math.max(0, offset),
    });
    res.json({ items: rows, total: count });
  } catch (err) {
    console.error('GET /users error:', err);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

module.exports = router;

