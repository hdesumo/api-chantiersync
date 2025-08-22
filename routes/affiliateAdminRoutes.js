// routes/affiliateAdminRoutes.js — endpoints d’admin (PLATFORM_ADMIN)
// ---------------------------------------------------------------------
const expressAff = require('express');
const routerAffAdmin = expressAff.Router();


const { authMiddleware, ROLES } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');


// Charge models de manière sûre
function getModels() {
try { return require('../models'); } catch (_) { return {}; }
}


// PARTNERS — CRUD minimal
routerAffAdmin.get('/affiliates/partners', authMiddleware, requireRole(ROLES.PLATFORM_ADMIN), async (req, res, next) => {
try {
const { AffiliatePartner } = getModels();
const rows = await (AffiliatePartner ? AffiliatePartner.findAll({ order: [['createdAt','DESC']] }) : []);
res.json({ items: rows });
} catch (e) { next(e); }
});


routerAffAdmin.post('/affiliates/partners', authMiddleware, requireRole(ROLES.PLATFORM_ADMIN), async (req, res, next) => {
try {
const { AffiliatePartner } = getModels();
if (!AffiliatePartner) return res.status(501).json({ error: 'Model not available' });
const created = await AffiliatePartner.create({ name: req.body.name, email: req.body.email, status: 'active' });
res.status(201).json(created);
} catch (e) { next(e); }
});


// LINKS — génération d’un code
routerAffAdmin.post('/affiliates/links', authMiddleware, requireRole(ROLES.PLATFORM_ADMIN), async (req, res, next) => {
try {
const { AffiliateLink } = getModels();
if (!AffiliateLink) return res.status(501).json({ error: 'Model not available' });
const code = (req.body.code || Math.random().toString(36).slice(2, 10)).toUpperCase();
const created = await AffiliateLink.create({ partner_id: req.body.partner_id, code, campaign: req.body.campaign || null });
res.status(201).json(created);
} catch (e) { next(e); }
});


// LEADS / CONVERSIONS — lecture simple
routerAffAdmin.get('/affiliates/leads', authMiddleware, requireRole(ROLES.PLATFORM_ADMIN), async (req, res, next) => {
try {
const { Lead } = getModels();
const where = req.query.code ? { affiliate_code: req.query.code } : {};
const items = await (Lead ? Lead.findAll({ where, limit: 200, order: [['landed_at','DESC']] }) : []);
res.json({ items });
} catch (e) { next(e); }
});


routerAffAdmin.get('/affiliates/conversions', authMiddleware, requireRole(ROLES.PLATFORM_ADMIN), async (req, res, next) => {
try {
const { Conversion } = getModels();
const where = req.query.code ? { affiliate_code: req.query.code } : {};
const items = await (Conversion ? Conversion.findAll({ where, limit: 200, order: [['converted_at','DESC']] }) : []);
res.json({ items });
} catch (e) { next(e); }
});


module.exports = routerAffAdmin;
