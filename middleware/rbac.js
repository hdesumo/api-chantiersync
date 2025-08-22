// File: middleware/rbac.js
// ---------------------------------------------------------------------
// Encodes the permission matrix and exposes composable guards.
const { ROLES: R } = require('./auth');


// Matrix from your spec
// Resource/Action → allowed roles
const PERMS = {
TENANTS: { CREATE_SUSPEND: [R.PLATFORM_ADMIN] },
USERS: { VIEW: [R.PLATFORM_ADMIN, R.TENANT_ADMIN, R.MANAGER] },
SITES: { VIEW: [R.PLATFORM_ADMIN, R.TENANT_ADMIN, R.MANAGER, R.STAFF],
MANAGE: [R.TENANT_ADMIN, R.MANAGER] },
REPORTS: { VIEW: [R.PLATFORM_ADMIN, R.TENANT_ADMIN, R.MANAGER],
EDIT_OWN: [R.STAFF],
MANAGE: [R.TENANT_ADMIN, R.MANAGER] },
MEDIA: { UPLOAD: [R.PLATFORM_ADMIN, R.TENANT_ADMIN, R.MANAGER, R.STAFF] },
BILLING: { MANAGE: [R.PLATFORM_ADMIN], VIEW: [R.TENANT_ADMIN] },
};


function requireRole(allowed) {
const allow = Array.isArray(allowed) ? allowed : [allowed];
return function (req, res, next) {
if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
if (!allow.includes(req.user.role)) {
return res.status(403).json({ error: 'Forbidden (role)' });
}
next();
};
}


// Ensures tenant-scoped access: the resource enterprise_id must equal req.user.enterprise_id
function requireSameEnterprise(getEnterpriseIdFromReq) {
return function (req, res, next) {
const user = req.user;
if (!user) return res.status(401).json({ error: 'Unauthenticated' });
// PLATFORM_ADMIN bypasses tenant scope for global read (🔍 glob.)
if (user.role === R.PLATFORM_ADMIN) return next();
const entId = getEnterpriseIdFromReq(req);
if (!entId) return res.status(400).json({ error: 'Missing enterprise_id on resource' });
if (String(entId) !== String(user.enterprise_id)) {
return res.status(403).json({ error: 'Forbidden (tenant scope)' });
}
next();
};
}


// For actions limited to a user's own objects (e.g., STAFF editing own reports)
function requireOwnership(getOwnerIdFromReq) {
return function (req, res, next) {
const user = req.user;
if (!user) return res.status(401).json({ error: 'Unauthenticated' });
const ownerId = getOwnerIdFromReq(req);
if (!ownerId) return res.status(400).json({ error: 'Missing owner id on resource' });
if (String(ownerId) !== String(user.id)) {
return res.status(403).json({ error: 'Forbidden (ownership)' });
}
next();
};
}


module.exports = { PERMS, requireRole, requireSameEnterprise, requireOwnership };


