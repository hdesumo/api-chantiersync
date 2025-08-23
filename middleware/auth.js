// middleware/auth.js
const jwt = require('jsonwebtoken');
const ROLES = require('./roles');

function normalizeRole(role) {
  if (role === 'ADMIN') return ROLES.PLATFORM_ADMIN; // compat anciens tokens
  return role || ROLES.STAFF;
}

function auth(requiredRoles = []) {
  return (req, res, next) => {
    try {
      // Bearer ou cookie
      let token = null;
      const h = req.headers['authorization'];
      if (h && h.startsWith('Bearer ')) token = h.slice(7);
      if (!token && req.cookies?.token) token = req.cookies.token;
      if (!token) return res.status(401).json({ error: 'Missing token' });

      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      const userId = payload.sub || payload.userId || payload.id || payload.uid;

      req.user = {
        id: userId,
        role: normalizeRole(payload.role),
        enterprise_id: payload.enterprise_id || null,
        _raw: payload,
      };

      if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
        if (!requiredRoles.includes(req.user.role)) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// Exports compatibles
auth.ROLES = ROLES;
module.exports = auth;            // require('../middleware/auth')
module.exports.ROLES = ROLES;     // const { ROLES } = require('../middleware/auth')
module.exports.default = auth;    // compat ESM transpiled

