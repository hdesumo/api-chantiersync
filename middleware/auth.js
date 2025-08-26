// middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification JWT
 * Vérifie le header Authorization et attache l'utilisateur décodé à req.user
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Forbidden: missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(403).json({ error: 'Forbidden: token invalid or expired' });
  }
}

module.exports = authMiddleware;

