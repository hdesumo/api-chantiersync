// controllers/siteController.js
'use strict';

const { Site, sequelize } = require('../models');
const { Op } = require('sequelize'); // au cas où, même si non essentiel

/** ===== Helpers génériques ===== **/

/** Retourne un modèle "léger" si disponible (désactive defaultScope potentiellement lourd) */
function getModel() {
  if (!Site) return null;
  return (typeof Site.unscoped === 'function') ? Site.unscoped() : Site;
}

/** Récupère une valeur d'entreprise depuis le JWT (si présente) */
function getEnterpriseValue(user) {
  return user?.enterprise_id ?? user?.enterpriseId ?? null;
}

/** Cherche la table "sites/site/…", en priorisant le schéma public et les noms les plus probables */
async function findSiteTable() {
  // Liste toutes les tables utilisateur
  const tables = await sequelize.query(
    `SELECT table_schema, table_name
     FROM information_schema.tables
     WHERE table_type='BASE TABLE'
       AND table_schema NOT IN ('pg_catalog','information_schema')`,
    { type: sequelize.QueryTypes.SELECT }
  );

  // candidates = tables contenant "site" dans le nom
  const candidates = tables
    .filter(t => /site/i.test(t.table_name))
    .map(t => ({ schema: t.table_schema, name: t.table_name }));

  if (candidates.length === 0) return null;

  // Priorisation simple : public.sites > public.site > *sites* > *site*
  candidates.sort((a, b) => {
    const score = (x) => {
      let s = 0;
      if (x.schema === 'public') s += 10;
      if (/^sites$/i.test(x.name)) s += 5;
      if (/^site$/i.test(x.name)) s += 4;
      if (/sites/i.test(x.name)) s += 2;
      if (/site/i.test(x.name)) s += 1;
      return -s; // tri asc, on retourne -score pour avoir le plus grand d'abord
    };
    return score(a) - score(b);
  });

  // Meilleur candidat
  return candidates[0];
}

/** Retourne la liste des colonnes d'une table (ordre naturel) */
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

/** Choisit la colonne d'ORDER BY (id si dispo, sinon 1ère colonne) */
function chooseOrderColumn(columns) {
  if (!columns || columns.length === 0) return null;
  const lower = columns.map(c => c.toLowerCase());
  const idxId = lower.indexOf('id');
  if (idxId >= 0) return columns[idxId];
  return columns[0];
}

/** Détecte la colonne d'entreprise (enterprise_id / enterpriseId / etc.) si existante */
function detectEnterpriseColumn(columns) {
  if (!columns || columns.length === 0) return null;
  const lower = columns.map(c => c.toLowerCase());
  const candidates = ['enterprise_id', 'enterpriseid', 'enterprise'];
  for (const c of candidates) {
    const i = lower.indexOf(c);
    if (i >= 0) return columns[i];
  }
  // heuristique: contient 'enterprise' et 'id'
  for (let i = 0; i < columns.length; i++) {
    const l = columns[i].toLowerCase();
    if (l.includes('enterprise') && l.includes('id')) return columns[i];
  }
  return null;
}

/** Pagination défensive */
function parsePagination(qs) {
  const limit  = Math.min(Math.max(parseInt(qs?.limit  ?? '50', 10) || 50, 1), 100);
  const offset = Math.max(parseInt(qs?.offset ?? '0', 10) || 0, 0);
  return { limit, offset };
}

/** ===== Fallback SQL brut (ne dépend pas du modèle Sequelize) ===== **/

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

/** ===== Handlers ===== **/

/** GET /api/sites — tente le modèle, sinon bascule en SQL brut auto-découverte */
async function list(req, res) {
  try {
    const { limit, offset } = parsePagination(req.query);
    const entVal = getEnterpriseValue(req.user);

    // 1) Tentative via modèle Sequelize (si présent ET correctement mappé)
    const Model = getModel();
    if (Model) {
      try {
        const where = {};
        // ajoute filtre entreprise seulement si la colonne existe dans le modèle
        const attrs = Model.rawAttributes ? Object.keys(Model.rawAttributes) : [];
        const entColInModel = entVal
          ? attrs.find(a => a.toLowerCase() === 'enterprise_id' || a.toLowerCase() === 'enterpriseid' || (a.toLowerCase().includes('enterprise') && a.toLowerCase().includes('id')))
          : null;
        if (entVal && entColInModel) where[entColInModel] = entVal;

        // Choix de la colonne d'ordre côté modèle
        const orderCol = (Array.isArray(Model.primaryKeyAttributes) && Model.primaryKeyAttributes[0])
          || (attrs.includes('id') ? 'id' : null);

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
        // On log puis on bascule en fallback SQL brut
        console.warn('sites.list model path failed, falling back to raw:', modelErr?.message || modelErr);
      }
    }

    // 2) Fallback SQL brut (auto-discovery)
    const out = await listViaRaw(req.user, limit, offset);
    return res.status(200).json({ ...out, limit, offset });
  } catch (err) {
    console.error('sites.list error:', err?.message || err);
    return res.status(500).json({ status: 'error', message: 'sites list failed' });
  }
}

/** GET /api/sites-probe — sonde ultra-légère (fallback SQL brut direct) */
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

/** GET /api/sites/:id/qr.png?size=256 — stub PNG 1x1 (à remplacer par ta génération QR) */
async function qr(req, res) {
  try {
    const { id } = req.params;
    const size = Math.min(parseInt(req.query.size || '256', 10) || 256, 1024);
    if (!id) return res.status(400).send('Missing id');

    // PNG 1x1 transparent (stub)
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

