// middleware/attribution.js — version liée aux AffiliateLink (drop-in)
...pick(body, ['utm_source','utm_medium','utm_campaign','utm_term','utm_content']),
};


const hasSignal = base.affiliate_id || base.click_id || Object.keys(utm).length || Object.keys(subs).length || Object.keys(subsBody).length;
if (!hasSignal) { req.attribution = null; return next(); }


// Tente de lier à AffiliateLink
const resolved = await resolveAffiliateLink({ affiliate_id: base.affiliate_id, click_id: base.click_id, qs, body });


const ip = getClientIp(req);
const user_agent = req.headers['user-agent'] || null;
const referer = req.headers['referer'] || req.headers['referrer'] || null;
const landing_page = body.landingPage || (referer ? `${referer}` : null);


const lead = await AffiliateLead.create({
affiliate_id: base.affiliate_id || null,
click_id: base.click_id || null,
affiliate_link_id: resolved?.link?.id || null,
affiliate_code: resolved?.code || null,
sub1: subs.sub1 || subsBody.sub1 || null,
sub2: subs.sub2 || subsBody.sub2 || null,
sub3: subs.sub3 || subsBody.sub3 || null,
sub4: subs.sub4 || subsBody.sub4 || null,
sub5: subs.sub5 || subsBody.sub5 || null,
utm_source: utm.utm_source || null,
utm_medium: utm.utm_medium || null,
utm_campaign: utm.utm_campaign || null,
utm_term: utm.utm_term || null,
utm_content: utm.utm_content || null,
landing_page,
referer,
ip,
user_agent,
status: 'lead',
matched_by: resolved?.matchedBy || null,
});


req.attribution = { leadId: lead.id };
} catch (err) {
console.error('captureLead failed:', err);
req.attribution = null;
} finally {
return next();
}
}


async function markConversion(leadId, { tenant_id = null, enterprise_id = null, user_id = null } = {}) {
try {
if (!leadId) return;
const payload = { status: 'converted', convertedAt: new Date() };
if (tenant_id) payload.tenant_id = tenant_id;
if (enterprise_id) payload.enterprise_id = enterprise_id;
if (user_id) payload.user_id = user_id;
await AffiliateLead.update(payload, { where: { id: leadId } });
} catch (err) {
console.error('markConversion failed:', err);
}
}


module.exports = { captureLead, markConversion };
