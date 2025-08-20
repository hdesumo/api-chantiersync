// controllers/siteController.js
const { Op } = require('sequelize');
const QRCode = require('qrcode');
const { randomUUID } = require('crypto');
const { Site } = require('../models');

// LIST — filtre texte (code/name/location)
exports.list = async (req, res) => {
  const where = { enterprise_id: req.user.enterprise_id };
  const q = (req.query.q || '').trim();
  if (q) {
    where[Op.or] = [
      { code: { [Op.iLike]: `%${q}%` } },
      { name: { [Op.iLike]: `%${q}%` } },
      { location: { [Op.iLike]: `%${q}%` } },
    ];
  }
  const rows = await Site.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json(rows);
};

// CREATE
exports.create = async (req, res) => {
  const { code, name, location, lat, lng, start_date } = req.body || {};
  if (!code || !name) return res.status(400).json({ error: 'code & name required' });
  const row = await Site.create({
    enterprise_id: req.user.enterprise_id, code, name, location, lat, lng, start_date
  });
  res.status(201).json(row);
};

// GET ONE
exports.getOne = async (req, res) => {
  const row = await Site.findOne({
    where: { id: req.params.id, enterprise_id: req.user.enterprise_id }
  });
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
};

// UPDATE
exports.update = async (req, res) => {
  const row = await Site.findOne({
    where: { id: req.params.id, enterprise_id: req.user.enterprise_id }
  });
  if (!row) return res.status(404).json({ error: 'Not found' });
  const { code, name, location, lat, lng, status, start_date, end_date } = req.body || {};
  await row.update({ code, name, location, lat, lng, status, start_date, end_date });
  res.json(row);
};

// DELETE
exports.remove = async (req, res) => {
  const row = await Site.findOne({
    where: { id: req.params.id, enterprise_id: req.user.enterprise_id }
  });
  if (!row) return res.status(404).json({ error: 'Not found' });
  await row.destroy();
  res.status(204).end();
};

/* ===========================
   QR CODE ENDPOINTS
   =========================== */

// PNG à imprimer (protégé par auth)
exports.qrPng = async (req, res) => {
  const site = await Site.findOne({
    where: { id: req.params.id, enterprise_id: req.user.enterprise_id }
  });
  if (!site) return res.status(404).json({ error: 'Not found' });

  // token si absent
  if (!site.qr_token) { site.qr_token = randomUUID(); await site.save(); }

  // contenu encodé dans le QR (préfixé pour filtrer côté scanner)
  const text = `site:${site.qr_token}`;

  // taille paramétrable (pixels)
  const size = Math.max(128, Math.min

