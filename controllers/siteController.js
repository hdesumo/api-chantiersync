// controllers/siteController.js
const { Site, sequelize } = require('../models');

/** Récupère l'enterprise_id depuis le JWT, quels que soient les noms utilisés */
function getEnterpriseId(user) {
  return user?.enterprise_id || user?.enterpriseId || null;
}

/** Neutralise un defaultScope potentiellement lourd */
function getModel() {
  return (typeof Site?.unscoped === 'function') ? Site.unscoped() : Site;
}

/** GET /api/sites — liste paginée, légère et sûre */
async function list(req, res) {
  try {
    const limit  = Math.min(parseInt(req.query.limit  || '50', 10), 100);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);

    const where = {};
    const entId = getEnterpriseId(req.user);
    if (entId) where.enterprise_id = entId;

    const Model = getModel();

    const rows = await Model.findAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'code', 'enterprise_id', 'createdAt', 'updatedAt'],
      subQuery: false,
      raw: true, // évite les getters coûteux et la sérialisation lente
    });

    const count = await Model.count({ where });

    return res.status(200).json({ count, rows, limit, offset });
  } catch (err) {
    console.error('sites.list error:', err);
    return res.status(500).json({ status: 'error', message: 'sites list failed' });
  }
}

/** GET /api/sites/:id/qr.png?size=256 — stub PNG 1x1 (remplace par ta génération QR) */
async function qr(req, res) {
  try {
    const { id } = req.params;
    const size = Math.min(parseInt(req.query.size || '256', 10), 1024);
    if (!id) return res.status(400).send('Missing id');

    // PNG 1x1 transparent (base64) — à remplacer par qrcode.toBuffer(...) plus tard
    const png1x1 = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+Vn3W9wAAAABJRU5ErkJggg==',
      'base64'
    );
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).send(png1x1);
  } catch (err) {
    console.error('sites.qr error:', err);
    return res.status(500).send('qr failed');
  }
}

/** GET /api/sites-probe — sonde SQL ultra-légère (bypass ORM) */
async function probe(_req, res) {
  try {
    const tn = typeof Site.getTableName === 'function' ? Site.getTableName() : (Site.tableName || 'Sites');
    const tableName = typeof tn === 'object' ? tn.tableName : tn;

    const [rows] = await sequelize.query(
      `SELECT id, name, code, "createdAt"
       FROM "${tableName}"
       ORDER BY "createdAt" DESC
       LIMIT 5`
    );
    return res.json({ rows });
  } catch (e) {
    console.error('sites.probe error:', e);
    return res.status(500).json({ error: 'probe failed' });
  }
}

module.exports = { list, qr, probe };

