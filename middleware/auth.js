// middleware/auth.js
const jwt = require('jsonwebtoken');

function normalizeRole(role) {
  // harmonise d'anciens rôles
  if (role === 'ADMIN') return 'PLATFORM_ADMIN';
  return role || 'STAFF';
}

/**
 * auth(requiredRoles?: string[])
 * Usage: router.get('/path', auth(['PLATFORM_ADMIN']), handler)
 */
module.exports = function auth(requiredRoles = []) {
  return (req, res, next) => {
    try {
      // Accepte Authorization: Bearer <token> ou cookie token
      let token = null;
      const h = req.headers['authorization'];
      if (h && h.startsWith('Bearer ')) token = h.slice(7);
      if (!token && req.cookies && req.cookies.token) token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ error: 'Missing token' });
      }

      const secret = process.env.JWT_SECRET || 'dev_secret';
      const payload = jwt.verify(token, secret);

      // Compat: certains JWT utilisent "sub" pour l’id
      const userId = payload.sub || payload.userId || payload.id || payload.uid;

      req.user = {
        id: userId,
        role: normalizeRole(payload.role),
        enterprise_id: payload.enterprise_id || null,
        // copie brute si besoin
        _raw: payload,
      };

      // RBAC
      if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
        const ok = requiredRoles.includes(req.user.role);
        if (!ok) return res.status(403).json({ error: 'Forbidden' });
      }

      return next();
    } catch (err) {
      // JWT périmé/invalid → 401
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

