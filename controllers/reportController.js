// controllers/reportController.js
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { Report, ReportMedia } = require('../models');

function safeUnlink(p) { if (p) fs.unlink(p, () => {}); }

exports.list = async (req, res) => {
  const where = { enterprise_id: req.user.enterprise_id };
  if (req.query.siteId) where.site_id = req.query.siteId;
  if (req.query.type) where.type = req.query.type;
  if (req.query.status) where.status = req.query.status;
  if (req.query.priority) where.priority = req.query.priority;

  const q = (req.query.q || '').trim();
  if (q) where[Op.or] = [
    { title: { [Op.iLike]: `%${q}%` } },
    { description: { [Op.iLike]: `%${q}%` } },
    { location: { [Op.iLike]: `%${q}%` } },
  ];

  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);

  const rows = await Report.findAll({
    where, order: [['createdAt','DESC']], limit, offset
  });
  res.json({ items: rows, nextOffset: rows.length === limit ? offset + limit : null });
};

exports.create = async (req, res) => {
  const { site_id, type, title, description, priority, location, client_ts } = req.body || {};
  if (!site_id || !type || !title) return res.status(400).json({ error: 'site_id, type, title required' });
  const row = await Report.create({
    enterprise_id: req.user.enterprise_id, site_id, user_id: req.user.uid,
    type, title, description, priority, location, client_ts
  });
  res.status(201).json(row);
};

exports.getOne = async (req, res) => {
  const row = await Report.findOne({
    where: { id: req.params.id, enterprise_id: req.user.enterprise_id },
    include: [ReportMedia],
    order: [[ReportMedia, 'createdAt', 'DESC']]
  });
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
};

exports.addAttachment = async (req, res) => {
  try {
    const report = await Report.findOne({
      where: { id: req.params.id, enterprise_id: req.user.enterprise_id }
    });
    if (!report) {
      if (req.file?.path) safeUnlink(req.file.path);
      return res.status(404).json({ error: 'Report not found' });
    }
    if (!req.file) return res.status(400).json({ error: 'file required' });

    const filename = path.basename(req.file.path);
    const relPath = `/uploads/${filename}`;
    const media = await ReportMedia.create({
      report_id: report.id,
      path: relPath,
      mime_type: req.file.mimetype,
      size: req.file.size,
      meta: { originalname: req.file.originalname }
    });

    res.status(201).json({ ...media.toJSON(), url: relPath, originalname: req.file.originalname });
  } catch (e) {
    if (req.file?.path) safeUnlink(req.file.path);
    res.status(500).json({ error: 'Upload failed' });
  }
};

exports.deleteAttachment = async (req, res) => {
  const { id, mediaId } = req.params;
  // assure que la pièce jointe appartient à un rapport du même tenant
  const media = await ReportMedia.findOne({
    where: { id: mediaId },
    include: [{ model: Report, where: { id, enterprise_id: req.user.enterprise_id } }]
  });
  if (!media) return res.status(404).json({ error: 'Attachment not found' });

  // supprime le fichier disque si présent
  const diskPath = path.join(__dirname, '..', media.path.replace(/^\//, ''));
  safeUnlink(diskPath);

  await media.destroy();
  res.status(204).end();
};

