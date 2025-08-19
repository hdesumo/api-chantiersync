// controllers/reportController.js
const path = require('path');
const fs = require('fs');
const { Report, ReportMedia } = require('../models');

exports.list = async (req, res) => {
  const where = { enterprise_id: req.user.enterprise_id };
  if (req.query.siteId) where.site_id = req.query.siteId;
  const rows = await Report.findAll({ where, order: [['createdAt','DESC']] });
  res.json(rows);
};

exports.create = async (req, res) => {
  const { site_id, type, title, description, priority, location, client_ts } = req.body || {};
  if (!site_id || !type || !title) return res.status(400).json({ error: 'site_id, type, title required' });
  const row = await Report.create({
    enterprise_id: req.user.enterprise_id,
    site_id, user_id: req.user.uid, type, title, description, priority, location, client_ts
  });
  res.status(201).json(row);
};

exports.addAttachment = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  const media = await ReportMedia.create({
    report_id: req.params.id,
    path: `/uploads/${req.file.filename}`,
    mime_type: req.file.mimetype,
    size: req.file.size,
    meta: { originalname: req.file.originalname }
  });
  res.status(201).json(media);
};

