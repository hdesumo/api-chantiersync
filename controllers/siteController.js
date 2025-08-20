// en haut
const QRCode = require('qrcode');
const { randomUUID } = require('crypto');
const { Site } = require('../models');

exports.qrPng = async (req, res) => {
  const site = await Site.findOne({
    where: { id: req.params.id, enterprise_id: req.user.enterprise_id }
  });
  if (!site) return res.status(404).json({ error: 'Not found' });

  // Sécurité: s'assure qu'on a bien un token
  if (!site.qr_token) { site.qr_token = randomUUID(); await site.save(); }

  // Contenu du QR (préfixé, pratique pour filtrer côté scanner)
  const text = `site:${site.qr_token}`;
  const png = await QRCode.toBuffer(text, {
    type: 'png', errorCorrectionLevel: 'M', margin: 1, scale: 8
  });
  res.set('Content-Type', 'image/png');
  res.send(png);
};

exports.rotateQr = async (req, res) => {
  const site = await Site.findOne({
    where: { id: req.params.id, enterprise_id: req.user.enterprise_id }
  });
  if (!site) return res.status(404).json({ error: 'Not found' });
  site.qr_token = randomUUID();
  await site.save();
  res.json({ qr_token: site.qr_token });
};

exports.getByToken = async (req, res) => {
  const site = await Site.findOne({
    where: { qr_token: req.params.token, enterprise_id: req.user.enterprise_id }
  });
  if (!site) return res.status(404).json({ error: 'Not found' });
  res.json(site);
};

const { Op } = require('sequelize');
const { Site } = require('../models');

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
  const rows = await Site.findAll({ where, order: [['createdAt','DESC']] });
  res.json(rows);
};

exports.create = async (req, res) => {
  const { code, name, location, lat, lng, start_date } = req.body || {};
  if (!code || !name) return res.status(400).json({ error: 'code & name required' });
  const row = await Site.create({
    enterprise_id: req.user.enterprise_id, code, name, location, lat, lng, start_date
  });
  res.status(201).json(row);
};

exports.getOne = async (req, res) => {
  const row = await Site.findOne({
    where: { id: req.params.id, enterprise_id: req.user.enterprise_id }
  });
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
};

exports.update = async (req, res) => {
  const row = await Site.findOne({
    where: { id: req.params.id, enterprise_id: req.user.enterprise_id }
  });
  if (!row) return res.status(404).json({ error: 'Not found' });
  const { code, name, location, lat, lng, status, start_date, end_date } = req.body || {};
  await row.update({ code, name, location, lat, lng, status, start_date, end_date });
  res.json(row);
};

exports.remove = async (req, res) => {
  const row = await Site.findOne({
    where: { id: req.params.id, enterprise_id: req.user.enterprise_id }
  });
  if (!row) return res.status(404).json({ error: 'Not found' });
  await row.destroy();
  res.status(204).end();
};

