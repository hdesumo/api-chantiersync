// middleware/attribution.js
// Capture les infos d'affiliation au moment du POST /api/auth/register-tenant
// et attache l'ID de "lead" dans req.attribution.leadId.
// Ensuite, le contrôleur appelle markConversion() quand la création tenant réussit.

const { AffiliateLead } = require('../models');
const os = require('os');

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff && typeof xff === 'string') {
    const first = xff.split(',')[0].trim();
    if (first) return first;
  }
  return req.socket?.remoteAddress || null;
}

function pick(obj, keys, fallback = {}) {
  const out = { ...fallback };
  for (const k of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) {
      out[k] = String(obj[k]);
    }
  }
  return out;
}

async function captureLead(req, res, next) {
  try {
    // Permettre de couper le programme si besoin
    const enabled = process.env.AFF_ENABLED !== 'false';
    if (!enabled) return next();

    const cookies = req.cookies || {};
    const qs = req.query || {};
    const body = (req.body && typeof req.body === 'object') ? req.body : {};

    // Signaux possibles d’affiliation (cookies, query, body)
    const base = {
      affiliate_id:
        cookies.aff ||
        qs.aff ||
        body.aff ||
        qs.ref ||
        body.ref ||
        null,
      click_id:
        cookies.aff_click ||
        qs.click_id ||
        body.click_id ||
        qs.cid ||
        body.cid ||
        null,
    };

    const subs = pick(qs, ['sub1','sub2','sub3','sub4','sub5']);
    const subsBody = pick(body, ['sub1','sub2','sub3','sub4','sub5']);
    const utm = {
      ...pick(qs, ['utm_source','utm_medium','utm_campaign','utm_term','utm_content']),
      ...pick(body, ['utm_source','utm_medium','utm_campaign','utm_term','utm_content']),
    };

    const affData = {
      ...base,
      ...subs,
      ...subsBody,
      ...utm,
    };

    // Rien à capturer ? on passe
    const hasSignal =
      affData.affiliate_id ||
      affData.click_id ||
      Object.keys(utm).length > 0 ||
      Object.keys(subs).length > 0 ||
      Object.keys(subsBody).length > 0;

    if (!hasSignal) {
      req.attribution = null;
      return next();
    }

    const ip = getClientIp(req);
    const user_agent = req.headers['user-agent'] || null;
    const referer = req.headers['referer'] || req.headers['referrer'] || null;

    // Optionnel : la landing page peut être passée par le formulaire
    const landing_page =
      body.landingPage ||
      (referer ? `${referer}` : null);

    const lead = await AffiliateLead.create({
      affiliate_id: affData.affiliate_id || null,
      click_id: affData.click_id || null,
      sub1: affData.sub1 || null,
      sub2: affData.sub2 || null,
      sub3: affData.sub3 || null,
      sub4: affData.sub4 || null,
      sub5: affData.sub5 || null,
      utm_source: affData.utm_source || null,
      utm_medium: affData.utm_medium || null,
      utm_campaign: affData.utm_campaign || null,
      utm_term: affData.utm_term || null,
      utm_content: affData.utm_content || null,
      landing_page: landing_page,
      referer,
      ip,
      user_agent,
      status: 'lead',
    });

    req.attribution = { leadId: lead.id };
  } catch (err) {
    console.error('captureLead failed:', err);
    // on ne bloque pas l’inscription même si la capture échoue
    req.attribution = null;
  } finally {
    return next();
  }
}

// À appeler depuis le contrôleur après réussite de la création du tenant
async function markConversion(leadId, { tenant_id = null, user_id = null } = {}) {
  try {
    if (!leadId) return;
    const payload = {
      status: 'converted',
      convertedAt: new Date(),
    };
    if (tenant_id) payload.tenant_id = tenant_id;
    if (user_id) payload.user_id = user_id;
    await AffiliateLead.update(payload, { where: { id: leadId } });
  } catch (err) {
    console.error('markConversion failed:', err);
  }
}

module.exports = {
  captureLead,
  markConversion,
};

