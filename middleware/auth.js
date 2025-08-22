// middleware/auth.js
// JWT verifier + compat rôles/claims pour Chantiersync
// - Exige JWT_SECRET (env)
// - Gère Authorization: Bearer, cookie "token", et X-Access-Token
// - Accepte payload { sub | uid }, { role }, { enterprise_id | enterpriseId }
// - Mappe role "ADMIN" -> "PLATFORM_ADMIN" (compat V1)
// - Options : JWT_ISSUER, JWT_AUDIENCE (facultatifs), CLOCK_TOLERANCE (sec)

const jwt = require('jsonwebtoken');

const ROLES = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
};

// ----- helpers -----
function extractToken(req) {
  // 1) Authorization: Bearer <token>
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  // 2) Cookie "token"
  if (req.cookies && req.cookies.token) {
    return String(req.cookies.token);
  }
  // 3) X-Access-Token
  if (req.headers && req.headers['x-access-token']) {
    return String(req.headers['x-access-token']);
  }
  return null;
}

function normalizeUserFromPayload(payload) {
  // id
  const id = payload.sub || payload.uid || payload.user_id || null;

  // role + compat ADMIN -> PLATFORM_ADMIN
  let role = payload.role || payload.roles?.[0] || null;
  if (role === 'ADMIN') role = ROLES.PLATFORM_ADMIN;

  // enterprise_id (alias)
  const enterprise_id =
    payload.enterprise_id ||
    payload.enterpriseId ||
    payload.ent_id ||
    null;

  return { id, role, enterprise_id };
}

// ----- middleware -----
function authMiddleware(req, res, next) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server misconfigured: missing JWT_SECRET' });
    }

    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    // Options de vérification
    const verifyOpts = {
      clockTolerance: Number(process.env.CLOCK_TOLERANCE || 5), // secondes
    };
    if (process.env.JWT_ISSUER) verifyOpts.issuer = process.env.JWT_ISSUER;
    if (process.env.JWT_AUDIENCE) verifyOpts.audience = process.env.JWT_AUDIENCE;

    const payload = jwt.verify(token, secret, verifyOpts);

    const user = normalizeUserFromPayload(payload);
    if (!user.id || !user.role) {
      return res.status(401).json({ error: 'Invalid token payload (id/role missing)' });
    }

    req.user = user; // { id, role, enterprise_id }
    return next();
  } catch (err) {
    // Erreurs fréquentes : TokenExpiredError, JsonWebTokenError, NotBeforeError
    const status = err.name === 'TokenExpiredError' ? 401 : 401;
    return res.status(status).json({ error: 'Invalid token', details: err.message });
  }
}

module.exports = { authMiddleware, ROLES };

