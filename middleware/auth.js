// middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Authentifie via header Authorization: Bearer <token>
 * Ajoute le payload dans req.user, sinon 401.
 */
function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const match = auth.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ error: 'Missing bearer token' });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'JWT_SECRET not configured' });
    }

    const token = match[1];
    const payload = jwt.verify(token, secret);

    // payload attendu: { uid, role, enterprise_id, iat, exp, ... }
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };
// Optionnel : support import par défaut si jamais
module.exports.default = authMiddleware;

