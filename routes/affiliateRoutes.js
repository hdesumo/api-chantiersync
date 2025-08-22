// routes/affiliateRoutes.js
'use strict';

const express = require('express');
const cookie = require('cookie');
const { Op } = require('sequelize');

const { Affiliate, AffiliateClick, AffiliateLead, AffiliateCommission } = require('../models'); // selon votre index.js
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const router = express.Router();

// GET /r/:code → set cookie + redirect vers la cible
router.get('/r/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const aff = await Affiliate.findOne({ where: { code, status: 'active' } });
    const target = process.env.AFF_REDIRECT_TARGET || 'https://app.chantiersync.com/auth/register';

    if (!aff) {
      return res.redirect(target);
    }

    // Log click
    await AffiliateClick.create({
      affiliate_id: aff.id,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
      ua: req.headers['user-agent'],
      landing_path: req.query?.to?.toString()?.slice(0, 512) || '/',
    });

    const days = parseInt(process.env.AFF_COOKIE_TTL_DAYS || '90', 10);
    const cookieName = process.env.AFF_COOKIE_NAME || 'cs_ref';
    const expires = new Date(Date.now() + days * 86400000);

    res.setHeader(
      'Set-Cookie',
      cookie.serialize(cookieName, String(aff.code), {
        path: '/',
        httpOnly: false, // lisible client pour afficher le code, OK MVP
        sameSite: 'Lax',
        secure: true,
        expires,
      })
    );

    const redirectTo = req.query?.to ? `${target}?to=${encodeURIComponent(req.query.to)}` : target;
    return res.redirect(302, redirectTo);
  } catch (e) {
    console.error('affiliate redirect error:', e);
    return res.redirect(process.env.AFF_REDIRECT_TARGET || '/');
  }
});

// Secured endpoints (dashboard affilié)
router.get(
  '/api/affiliate/me',
  auth,
  rbac.allow(rbac.Roles.AFFILIATE, rbac.Roles.PLATFORM_ADMIN),
  async (req, res) => {
    try {
      // Ici, deux approches:
      // 1) Si un affilié est un user avec role AFFILIATE, on mappe par user.email
      // 2) Sinon, on stocke affiliateId sur le user
      const aff = await Affiliate.findOne({
        where: { email: req.user.email }, // ajustez si vous avez user_id
      });
      if (!aff) return res.status(404).json({ error: 'Affiliate not found' });

      const [clicks, leads, commissions] = await Promise.all([
        AffiliateClick.count({ where: { affiliate_id: aff.id } }),
        AffiliateLead.count({ where: { affiliate_id: aff.id } }),
        AffiliateCommission.findAll({
          where: { affiliate_id: aff.id },
          order: [['createdAt', 'DESC']],
          limit: 12,
        }),
      ]);

      const earned = commissions
        .filter((c) => c.status === 'approved' || c.status === 'paid')
        .reduce((sum, c) => sum + Number(c.amount || 0), 0);

      res.json({
        affiliate: {
          id: aff.id,
          code: aff.code,
          name: aff.name,
          email: aff.email,
          rate: aff.rate,
          currency: aff.currency,
          status: aff.status,
        },
        metrics: { clicks, leads, earned },
        recentCommissions: commissions,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'affiliate stats failed' });
    }
  }
);

module.exports = router;

