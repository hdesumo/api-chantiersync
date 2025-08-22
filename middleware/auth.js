// middleware/auth.js — JWT verifier
// ==================================
// Usage: app montera automatiquement ce middleware si present
// Exige que process.env.JWT_SECRET soit défini


const jwt = require('jsonwebtoken');


const ROLES = {
PLATFORM_ADMIN: 'PLATFORM_ADMIN',
TENANT_ADMIN: 'TENANT_ADMIN',
MANAGER: 'MANAGER',
STAFF: 'STAFF',
};


function extractToken(req) {
// Priorité à Authorization: Bearer <token>
const header = req.headers['authorization'] || '';
if (header.startsWith('Bearer ')) return header.slice(7);
// Optionnel: cookie "token"
if (req.cookies && req.cookies.token) return req.cookies.token;
// Optionnel: X-Access-Token
if (req.headers['x-access-token']) return String(req.headers['x-access-token']);
return null;
}


function authMiddleware(req, res, next) {
const token = extractToken(req);
if (!token) return res.status(401).json({ error: 'Missing token' });
try {
const payload = jwt.verify(token, process.env.JWT_SECRET);
// Attendus dans le payload: sub, role, enterprise_id
if (!payload || !payload.sub || !payload.role) {
return res.status(401).json({ error: 'Invalid token payload' });
}
req.user = {
id: payload.sub,
role: payload.role,
enterprise_id: payload.enterprise_id || null,
};
return next();
} catch (e) {
return res.status(401).json({ error: 'Invalid token' });
}
}


module.exports = { authMiddleware, ROLES };
