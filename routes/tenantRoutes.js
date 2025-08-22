// File: routes/tenantRoutes.js
// ---------------------------------------------------------------------
const express = require('express');
const { authMiddleware, ROLES } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const router = express.Router();


// PLATFORM endpoints (no tenant scope)
router.post('/create', authMiddleware, requireRole(ROLES.PLATFORM_ADMIN), async (req, res, next) => {
try {
// ... create tenant
res.json({ ok: true });
} catch (e) { next(e); }
});


router.post('/:tenantId/suspend', authMiddleware, requireRole(ROLES.PLATFORM_ADMIN), async (req, res, next) => {
try {
// ... suspend tenant
res.json({ ok: true });
} catch (e) { next(e); }
});


module.exports = router;
