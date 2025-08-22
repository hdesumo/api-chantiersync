// File: routes/billingRoutes.js
// ---------------------------------------------------------------------
const express6 = require('express');
const { authMiddleware: auth6, ROLES: ROLES6 } = require('../middleware/auth');
const { requireRole: reqRole6, requireSameEnterprise: reqSameEnt6 } = require('../middleware/rbac');
const routerBilling = express6.Router();


// Manage (PLATFORM_ADMIN)
routerBilling.post('/plan', auth6, reqRole6(ROLES6.PLATFORM_ADMIN), async (req, res, next) => {
try {
// ... create/update plan/license for a tenant
res.json({ ok: true });
} catch (e) { next(e); }
});


// View (TENANT_ADMIN) limited to its enterprise
routerBilling.get('/invoices', auth6, reqRole6([ROLES6.PLATFORM_ADMIN, ROLES6.TENANT_ADMIN]),
reqSameEnt6((req) => req.query.enterprise_id || req.user.enterprise_id),
async (req, res, next) => {
try {
const enterpriseId = req.user.role === ROLES6.PLATFORM_ADMIN ? (req.query.enterprise_id) : req.user.enterprise_id;
res.json({ items: [], enterprise_id: enterpriseId });
} catch (e) { next(e); }
}
);


module.exports = routerBilling;
