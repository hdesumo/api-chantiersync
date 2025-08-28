// middleware/auth.js
const jwt = require("jsonwebtoken");

// Middleware pour vérifier le JWT
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token invalide" });
  }
}

// Middleware pour vérifier le rôle
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Accès interdit" });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };

