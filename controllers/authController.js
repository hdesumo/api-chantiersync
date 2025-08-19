// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Enterprise } = require('../models');

exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });
  const user = await User.findOne({ where: { email }, include: [Enterprise] });
  if (!user || !user.is_active) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const payload = { uid: user.id, role: user.role, enterprise_id: user.enterprise_id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.full_name, role: user.role, enterprise: user.Enterprise.slug } });
};

