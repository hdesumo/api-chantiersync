// controllers/siteController.js
const { Site, sequelize } = require('../models');

function getEnterpriseId(user) {
  return user?.enterprise_id || user?.enterpriseId || null;
}

// neutralise un defaultScope potentiellement lourd
function unscoped(Model) {
  return typeof Model.unscoped === 'function' ? Model.unscoped() : Model;
}

// GET /api/sites
exports.list = async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit || '50', 10), 100);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);

    const where = {};
    const entId = getEnterpriseId(req.user);
    if (entId) where.enterprise_id = entId;

    const Model = unscoped(Site);
    const rows = await Model.findAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'code', 'enterprise_id', 'createdAt', 'updatedAt'],
      subQuery: false,
      raw: true, // évite les getters coûteux
    });

    const count = await Model.count({ where });

    return res.status(200).json({ count, rows, limit, offset });
  } catch (err) {
    console.error('sites.list error:', err);
    return res.status(500).json({ status: 'error', message: 'sites list failed' });
  }
};

// GET /api/sites/:id/qr.png?size=256
// (placeholder simple; remplace par ton implémentation QR si déjà existante)
exports.qr = async (req, res) => {
  try {
    const { id } = req.params;
    const size = Math.min(parseInt(req.query.size || '256', 10), 1024);
    if (!id) return res.status(400).send('Missing id');

    // Exemple: retourne un PNG vide 1x1 si tu n'as pas encore branché le QR
    // Remplace par ton générateur (e.g. qrcode.toBuffer)
    const png1x1 = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+Vn3W9wAAAABJRU5ErkJggg==',

