// File: routes/reportRoutes.js (RBAC + ownership)
// ---------------------------------------------------------------------
const express4 = require('express');
const { authMiddleware: auth4, ROLES: ROLES4 } = require('../middleware/auth');
const { requireRole: reqRole4, requireSameEnterprise: reqSameEnt4, requireOwnership } = require('../middleware/rbac');
const routerReports = express4.Router();


// View reports (PLATFORM_ADMIN global; TENANT_ADMIN/MANAGER scoped)
routerReports.get('/', auth4, reqRole4([ROLES4.PLATFORM_ADMIN, ROLES4.TENANT_ADMIN, ROLES4.MANAGER]),
reqSameEnt4((req) => req.query.enterprise_id || req.user.enterprise_id),
async (req, res, next) => {
try {
const enterpriseId = req.user.role === ROLES4.PLATFORM_ADMIN ? (req.query.enterprise_id) : req.user.enterprise_id;
res.json({ items: [], enterprise_id: enterpriseId });
} catch (e) { next(e); }
}
);


// STAFF create/edit their own within tenant scope
routerReports.post('/', auth4, reqRole4([ROLES4.STAFF, ROLES4.TENANT_ADMIN, ROLES4.MANAGER]),
reqSameEnt4((req) => req.body.enterprise_id || req.user.enterprise_id),
async (req, res, next) => {
try {
// owner is req.user.id if STAFF creates
res.status(201).json({ created: true, owner_id: req.user.id });
} catch (e) { next(e); }
}
);


routerReports.patch('/:id', auth4, reqRole4([ROLES4.STAFF, ROLES4.TENANT_ADMIN, ROLES4.MANAGER]),
reqSameEnt4((req) => req.body.enterprise_id || req.user.enterprise_id),
async (req, res, next) => {
try {
// If role is STAFF → enforce ownership
if (req.user.role === ROLES4.STAFF) {
// fetch report, get owner_id
const reportOwnerId = 'owner-id-from-db'; // replace by real lookup
const fakeReq = { ...req };
requireOwnership(() => reportOwnerId)(fakeReq, res, () => {});
if (res.headersSent) return; // ownership failed
}
res.json({ updated: true });
} catch (e) { next(e); }
}
);


module.exports = routerReports;
