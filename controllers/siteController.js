// controllers/siteController.js
'use strict';

const { Site } = require('../models');

/** Retourne le modèle "léger" (sans defaultScope potentiellement lourd) */
function getModel() {
  if (!Site) throw new Error('Site model not found');
  return (typeof Site.unscoped === 'function') ? Site.unscoped() : Site;
}

/** Détecte le nom de colonne "enterprise_id" selon le schéma réel (snake/camel) */
function detectEnterpriseColumn(Model) {
  const attrs = Model?.rawAttributes ? Object.keys(Model.rawAttributes) : [];
  const lowered = attrs.map(k => k.toLowerCase());

  // Priorités explicites
  const candidates = ['enterprise_id', 'enterpriseid', 'enterpriseId'];
  for (const c of candidates) {
    const idx = lowered.indexOf(c.toLowerCase());
    if (idx >= 0) return attrs[idx];
  }

  // Heuristique: un champ qui contient "enterprise" et "id"
  for (let i = 0; i < attrs.length; i++) {
    const k = attrs[i]; const l = k.toLowerCase();
    if (l.includes('enterprise') && l.includes('id')) return k;
  }
  return null;
}

/** Détecte la colonne pour l'ORDER BY (PK si possible, sinon 'id', sinon le 1er champ) */
function detectOrderColumn(Model) {
  const pk = Array.isArray(Model?.primaryKeyAttributes) && Model.primaryKeyAttributes[0];
  if (pk) return pk;

  const attrs = Model?.rawAttributes ? Object.keys(Model.rawAttributes) : [];
  if (attrs.includes('id')) return 'id';
  return attrs[0] || null;
}

/** Construit un where filtré par entreprise SI et seulement si la colonne existe */
function buildWhere(Model, user) {
  const where = {};
  if (!user) return where;

  const entVal = user.enterprise_id ?? user.enterpriseId ?? null;
  if (!entVal) return where;

  const entCol = detectEnterpriseColumn(Model);
  if (!entCol) return where; // ne filtre pas si la colonne n’existe pas

  where[entCol] = entVal;
  return where;
}

/** Parsing défensif de limit/offset */
function parsePagination(qs) {
  const limit = Math.min(Math.max(parseInt(qs.limit ?? '50', 10) || 50, 1), 100);
  const offset = Math.max(parseInt(qs.offset ?? '0', 10) || 0, 0);
  return { limit, offset };
}

/** GET /api/sites — liste paginée, légère, sans colonnes imposées */
async function list(req, res) {
  try {
    const Model = getModel();
    const { limit, offset } = parsePagination(req.query);
    const where = buildWhere(Model, req.user);
    const orderCol = detectOrderColumn(Model);

    const rows = await Model.findAll({
      where,
      limit,
      offset,
      ...(orderCol ? { order: [[orderCol, 'DESC']] } : {}),
      subQuery: false,
      raw: true, // sérialisation ultra rapide
    });

    const count = await Model.count({ where });
    return res.status(200).json({ count, rows, limit, offset });
  } catch (err) {
    console.error('sites.list error:', err?.message || err);
    return res.status(500).json({ status: 'error', message: 'sites list failed' });
  }
}

/** GET /api/sites-probe — sonde simple via Sequelize (aucune colonne imposée) */
async function probe(_req, res) {
  try {
    const Model = getModel();
    const orderCol = detectOrderColumn(Model);

    const rows = await Model.findAll({
      limit: 5,
      ...(orderCol ? { order: [[orderCol, 'DESC']] } : {}),
      raw: true,
    });

    return res.json({ rows });
  } catch (e) {
    console.error('sites.probe error:', e?.message || e);
    return res.status(500).json({ error: 'probe failed' });
  }
}

/** GET /api/sites/:id/qr.png?size=256 — stub PNG 1x1 (remplace par ta génération QR) */
async function qr(req, res) {
  try {
    const { id } = req.params;
    const size = Math.min(parseInt(req.query.size || '256', 10) || 256, 1024);
    if (!id) return res.status(400).send('Missing id');

    // Stub PNG 1x1 transparent (à remplacer par un vrai QR si besoin)
    const png1x1 = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+Vn3W9wAAAABJRU5ErkJggg==',
      'base64'
    );
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).send(png1x1);
  } catch (err) {
    console.error('sites.qr error:', err?.message || err);
    return res.status(500).send('qr failed');
  }
}

module.exports = { list, probe, qr };

