const jwt = require('jsonwebtoken');
const ROLES = require('./roles');

/**
 * Middleware factory : auth(allowedRoles)
 * - Vérifie le JWT
 * - Vérifie le rôle si des rôles sont passés
 */
function auth(allowedRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ error: 'Forbidden: missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded;

      // Vérification rôle si nécessaire
      if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({ error: 'Forbidden: insufficient role' });
        }
      }

      next();
    } catch (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ error: 'Forbidden: token invalid or expired' });
    }
  };
}

module.exports = auth;

