// File: routes/userRoutes.js
// ---------------------------------------------------------------------
const express2 = require('express');
const { authMiddleware: auth2, ROLES: ROLES2 } = require('../middleware/auth');
const { requireRole: reqRole2, requireSameEnterprise: reqSameEnt2 } = require('../middleware/rbac');
const routerUsers = express2.Router();


// View users in a tenant: PLATFORM_ADMIN (global), TENANT_ADMIN & MANAGER (scoped)
routerUsers.get('/', auth2, reqRole2([ROLES2.PLATFORM_ADMIN, ROLES2.TENANT_ADMIN, ROLES2.MANAGER]),
reqSameEnt2((req) => req.query.enterprise_id || req.user.enterprise_id),
async (req, res, next) => {
try {
// if PLATFORM_ADMIN → can pass enterprise_id=... to view any tenant
const enterpriseId = req.user.role === ROLES2.PLATFORM_ADMIN ? (req.query.enterprise_id) : req.user.enterprise_id;
// ... list users for enterpriseId
res.json({ items: [], enterprise_id: enterpriseId });
} catch (e) { next(e); }
}
);


module.exports = routerUsers;
