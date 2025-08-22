// File: routes/siteRoutes.js (RBAC applied)
// ---------------------------------------------------------------------
const express3 = require('express');
const { authMiddleware: auth3, ROLES: ROLES3 } = require('../middleware/auth');
const { requireRole: reqRole3, requireSameEnterprise: reqSameEnt3 } = require('../middleware/rbac');
const routerSites = express3.Router();


// View sites (all roles can view; STAFF is scoped)
routerSites.get('/', auth3, reqRole3([ROLES3.PLATFORM_ADMIN, ROLES3.TENANT_ADMIN, ROLES3.MANAGER, ROLES3.STAFF]),
reqSameEnt3((req) => req.query.enterprise_id || req.user.enterprise_id),
async (req, res, next) => {
try {
const enterpriseId = req.user.role === ROLES3.PLATFORM_ADMIN ? (req.query.enterprise_id) : req.user.enterprise_id;
res.json({ items: [], enterprise_id: enterpriseId });
} catch (e) { next(e); }
}
);


// Manage sites (TENANT_ADMIN, MANAGER)
routerSites.post('/', auth3, reqRole3([ROLES3.TENANT_ADMIN, ROLES3.MANAGER]),
reqSameEnt3((req) => req.body.enterprise_id || req.user.enterprise_id),
async (req, res, next) => {
try {
// ... create site in req.user.enterprise_id
res.status(201).json({ created: true });
} catch (e) { next(e); }
}
);


module.exports = routerSites;
