const jwt = require('jsonwebtoken');

const ROLES = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
};

function normalizeRole(role) {
  if (role === 'ADMIN') return ROLES.PLATFORM_ADMIN; // compat avec anciens tokens
  return role || ROLES.STAFF;
}

function auth(requiredRoles = []) {
  return (req, res, next) => {
    try {
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
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// ➡️ Exporte à la fois la fonction et les rôles
auth.ROLES = ROLES;              // permet auth.ROLES.PLATFORM_ADMIN
module.exports = auth;           // require('../middleware/auth')
module.exports.ROLES = ROLES;    // const { ROLES } = require('../middleware/auth')
module.exports.default = auth;   // compat import ESM transpiled

