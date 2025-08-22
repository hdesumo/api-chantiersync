// File: routes/mediaRoutes.js
// ---------------------------------------------------------------------
const express5 = require('express');
const { authMiddleware: auth5, ROLES: ROLES5 } = require('../middleware/auth');
const { requireRole: reqRole5, requireSameEnterprise: reqSameEnt5 } = require('../middleware/rbac');
const routerMedia = express5.Router();


routerMedia.post('/upload', auth5, reqRole5([ROLES5.PLATFORM_ADMIN, ROLES5.TENANT_ADMIN, ROLES5.MANAGER, ROLES5.STAFF]),
reqSameEnt5((req) => req.body.enterprise_id || req.user.enterprise_id),
async (req, res, next) => {
try {
// ... handle upload
res.status(201).json({ uploaded: true });
} catch (e) { next(e); }
}
);


module.exports = routerMedia;
