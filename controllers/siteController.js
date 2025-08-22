// controllers/siteController.js
'use strict';

const { Site, sequelize } = require('../models');

// ---- (optionnel) QR code : on essaye 'qrcode', sinon stub 1x1
let QRCode = null;
try {
  QRCode = require('qrcode'); // npm i qrcode
} catch (_) {
  QRCode = null;
}

/* ===================== Helpers génériques ===================== */

function getModel() {
  // Renvoie un modèle "léger" si possible (désactive un defaultScope coûteux)
  if (!Site) return null;
  return (typeof Site.unscoped === 'function') ? Site.unscoped() : Site;
}

function getEnterpriseValue(user) {
  return user?.enterprise_id ?? user?.enterpriseId ?? null;
}

function parsePagination(qs) {
  const limit  = Math.min(Math.max(parseInt(qs?.limit  ?? '50', 10) || 50, 1), 100);
  const offset = Math.max(parseInt(qs?.offset ?? '0', 10) || 0, 0);
  return { limit, offset };
}

/* ===================== Auto-découverte SQL (fallback) ===================== */

async function findSiteTable() {
  const tables = await sequelize.query(
    `SELECT table_schema, table_name
       FROM information_schema.tables
      WHERE table_type='BASE TABLE'
        AND table_schema NOT IN ('pg_catalog','information_schema')`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const candidates = tables
    .filter(t => /site/i.test(t.table_name))
    .map(t => ({ schema: t.table_schema, name: t.table_name }));

  if (candidates.length === 0) return null;

  // Priorité : public.sites > public.site > *sites* > *site*
  candidates.sort((a, b) => {
    const score = (x) => {
      let s = 0;
      if (x.schema === 'public') s += 10;
      if (/^sites$/i.test(x.name)) s += 5;
      if (/^site$/i.test(x.name)) s += 4;
      if (/sites/i.test(x.name)) s += 2;
      if (/site/i.test(x.name)) s += 1;
      return -s;
    };
    return score(a) - score(b);
  });

  return candidates[0];
}

async function getColumns(schema, table) {
  const rows = await sequelize.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = :schema AND table_name = :table
      ORDER BY ordinal_position`,
    {
      replacements: { schema, table },
      type: sequelize.QueryTypes.SELECT,
    }
  );
  return rows.map(r => r.column_name);
}

function chooseOrderColumn(columns) {
  if (!columns || columns.length === 0) return null;
  const lower = columns.map(c => c.toLowerCase());
  const idxId = lower.indexOf('id');
  if (idxId >= 0) return columns[idxId];
  return columns[0];
}

function detectEnterpriseColumn(columns) {
  if (!columns || columns.length === 0) return null;
  const lower = columns.map(c => c.toLowerCase());
  const exacts = ['enterprise_id', 'enterpriseid'];
  for (const e of exacts) {
    const i = lower.indexOf(e);
    if (i >= 0) return columns[i];
  }
  for (let i = 0; i < columns.length; i++) {
    const l = columns[i].toLowerCase();
    if (l.includes('enterprise') && l.includes('id')) return columns[i];
  }
  return null;
}

async function listViaRaw(user, limit, offset) {
  const table = await findSiteTable();
  if (!table) return { count: 0, rows: [] };

  const cols = await getColumns(table.schema, table.name);
  if (!cols || cols.length === 0) return { count: 0, rows: [] };

  const orderCol = chooseOrderColumn(cols);
  const entVal   = getEnterpriseValue(user);
  const entCol   = entVal ? detectEnterpriseColumn(cols) : null;

  const fq = `"${table.schema}"."${table.name}"`;
  const whereSql = entCol ? `WHERE "${entCol}" = :entVal` : '';

  const rows = await sequelize.query(
    `SELECT *
       FROM ${fq}
       ${whereSql}
       ${orderCol ? `ORDER BY "${orderCol}" DESC` : ''}
       LIMIT :limit OFFSET :offset`,
    {
      replacements: { entVal, limit, offset },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  const countRow = await sequelize.query(
    `SELECT COUNT(*)::bigint AS count
       FROM ${fq}
       ${whereSql}`,
    {
      replacements: { entVal },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  const count = parseInt(countRow?.[0]?.count || '0', 10);
  return { count, rows };
}

/* ===================== Handlers ===================== */

// GET /api/sites
async function list(req, res) {
  try {
    const { limit, offset } = parsePagination(req.query);
    const entVal = getEnterpriseValue(req.user);

    // 1) Tentative via modèle Sequelize (si correctement mappé)
    const Model = getModel();
    if (Model) {
      try {
        const where = {};
        const attrs = Model.rawAttributes ? Object.keys(Model.rawAttributes) : [];
        const entColInModel = entVal
          ? attrs.find(a => {
              const l = a.toLowerCase();
              return l === 'enterprise_id' || l === 'enterpriseid' || (l.includes('enterprise') && l.includes('id'));
            })
          : null;

        if (entVal && entColInModel) where[entColInModel] = entVal;

        const orderCol =
          (Array.isArray(Model.primaryKeyAttributes) && Model.primaryKeyAttributes[0]) ||
          (attrs.includes('id') ? 'id' : null);

        const rows = await Model.findAll({
          where,
          limit,
          offset,
          ...(orderCol ? { order: [[orderCol, 'DESC']] } : {}),
          subQuery: false,
          raw: true,
        });
        const count = await Model.count({ where });
        return res.status(200).json({ count, rows, limit, offset });
      } catch (modelErr) {
        console.warn('sites.list: model path failed, fallback to raw →', modelErr?.message || modelErr);
      }
    }

    // 2) Fallback SQL brut (auto-découverte)
    const out = await listViaRaw(req.user, limit, offset);
    return res.status(200).json({ ...out, limit, offset });
  } catch (err) {
    console.error('sites.list error:', err?.message || err);
    return res.status(500).json({ status: 'error', message: 'sites list failed' });
  }
}

// GET /api/sites-probe
async function probe(_req, res) {
  try {
    const table = await findSiteTable();
    if (!table) return res.json({ rows: [] });

    const cols = await getColumns(table.schema, table.name);
    if (!cols || cols.length === 0) return res.json({ rows: [] });

    const orderCol = chooseOrderColumn(cols);
    const fq = `"${table.schema}"."${table.name}"`;

    const rows = await sequelize.query(
      `SELECT *
         FROM ${fq}
         ${orderCol ? `ORDER BY "${orderCol}" DESC` : ''}
         LIMIT 5`,
      { type: sequelize.QueryTypes.SELECT }
    );

    return res.json({ rows });
  } catch (e) {
    console.error('sites.probe error:', e?.message || e);
    return res.status(500).json({ error: 'probe failed' });
  }
}

// GET /api/sites/:id/qr.png?size=256
async function qr(req, res) {
  try {
    const { id } = req.params;
    const size = Math.min(parseInt(req.query.size || '256', 10) || 256, 1024);
    if (!id) return res.status(400).send('Missing id');

    // URL encodée dans le QR (ouvre la fiche admin)
    const base = process.env.QR_URL_BASE || 'https://admin.chantiersync.com';
    const url  = `${base}/sites/${id}?src=qr`;

    if (QRCode && typeof QRCode.toBuffer === 'function') {
      const png = await QRCode.toBuffer(url, {
        width: size,
        errorCorrectionLevel: 'M',
        margin: 1,
      });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=300, immutable');
      return res.status(200).send(png);
    }

    // Fallback : PNG 1x1 transparent si la lib n'est pas installée
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

