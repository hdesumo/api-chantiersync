// controllers/siteController.js
const { Site } = require('../models');
exports.list = async (req, res) => {
  const rows = await Site.findAll({ where: { enterprise_id: req.user.enterprise_id }, order: [['createdAt','DESC']] });
  res.json(rows);
};
exports.create = async (req, res) => {
  const { code, name, location, lat, lng, start_date } = req.body || {};
  if (!code || !name) return res.status(400).json({ error: 'code & name required' });
  const row = await Site.create({ enterprise_id: req.user.enterprise_id, code, name, location, lat, lng, start_date });
  res.status(201).json(row);
};

