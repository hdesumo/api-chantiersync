// routes/authRoutes.js
'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * POST /api/auth/login
 * (monté via app.use('/api', router) dans app.js)
 * Seed: admin@demo.local / admin123
 */
router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (email !== 'admin@demo.local' || password !== 'admin123') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'JWT_SECRET not configured' });

    const payload = {
      uid: '0b82a3d3-c8bf-4a5e-8d4a-d41d93f87f78',
      role: 'ADMIN',
      enterprise_id: process.env.DEMO_ENTERPRISE_ID || 'a77c6345-c79d-4c31-a1b1-2459e8178c05',
    };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    return res.json({
      token,
      user: { id: payload.uid, name: 'Admin Demo', role: payload.role, enterprise: 'demo' },
    });
  } catch (e) {
    console.error('auth/login error:', e);
    return res.status(500).json({ error: 'login failed' });
  }
});

module.exports = router;

