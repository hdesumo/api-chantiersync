// controllers/enterpriseController.js
const path = require('path');
const { Enterprise } = require('../models');

const PUBLIC_API_URL = process.env.PUBLIC_API_URL || 'http://localhost:8080';

exports.create = async (req, res) => {
  try {
    const { name, slug, phone, address } = req.body;

    let leaders = [];
    if (Array.isArray(req.body.leaders)) {
      leaders = req.body.leaders;
    } else {
      leaders = Object.keys(req.body)
        .filter(k => k.startsWith('leaders['))
        .sort((a, b) => Number(a.match(/\[(\d+)\]/)?.[1] ?? 0) - Number(b.match(/\[(\d+)\]/)?.[1] ?? 0))
        .map(k => (req.body[k] || '').trim())
        .filter(Boolean);
    }

    const logo_url = req.file
      ? `${PUBLIC_API_URL}/uploads/logos/${path.basename(req.file.filename)}`
      : null;

    const enterprise = await Enterprise.create({
      name, slug, phone, address, logo_url, leaders
    });

    return res.status(201).json({ enterprise });
  } catch (e) {
    console.error('[enterprise.create]', e);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    const { rows, count } = await Enterprise.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit, offset
    });

    return res.json({ items: rows, total: count, limit, offset });
  } catch (e) {
    console.error('[enterprise.list]', e);
    return res.status(500).json({ error: 'Server error' });
  }
};

