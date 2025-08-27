// middleware/requireRole.js
module.exports = function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: "Accès interdit : rôle insuffisant" });
    }

    next();
  };
};

