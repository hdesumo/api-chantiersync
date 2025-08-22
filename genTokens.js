// genTokens.js — Générateur de JWT de test
// 1) npm i jsonwebtoken
// 2) export JWT_SECRET=change_me # ou passez --secret "..."
// 3) node genTokens.js # imprime les tokens + écrit un fichier tokens-<date>.json
// 4) Optionnel: node genTokens.js --exp 30d --ent ENT_DEMO --secret "xxx"
//
// Notes:
// - sub = user id
// - role = PLATFORM_ADMIN | TENANT_ADMIN | MANAGER | STAFF
// - enterprise_id = obligatoire pour les rôles tenant (sauf PLATFORM_ADMIN côté plateforme)


const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');


// Parse CLI args
const args = process.argv.slice(2);
function getArg(name, def = undefined) {
const idx = args.findIndex(a => a === `--${name}` || a.startsWith(`--${name}=`));
if (idx === -1) return def;
const val = args[idx].includes('=') ? args[idx].split('=')[1] : args[idx + 1];
return val === undefined ? true : val;
}


const SECRET = getArg('secret', process.env.JWT_SECRET);
if (!SECRET) {
console.error('✖ Missing JWT secret. Set env JWT_SECRET or use --secret "..."');
process.exit(1);
}
const EXP = getArg('exp', '7d');
const ENT = getArg('ent', 'ENT_DEMO');


// Sample users (one per role)
const users = [
{ label: 'platformAdmin', sub: 'u_platform', role: 'PLATFORM_ADMIN', enterprise_id: null },
{ label: 'tenantAdmin', sub: 'u_tenant_admin', role: 'TENANT_ADMIN', enterprise_id: ENT },
{ label: 'manager', sub: 'u_manager', role: 'MANAGER', enterprise_id: ENT },
{ label: 'staff', sub: 'u_staff', role: 'STAFF', enterprise_id: ENT },
];


function signToken({ sub, role, enterprise_id }) {
const payload = { sub, role };
if (enterprise_id) payload.enterprise_id = enterprise_id;
return jwt.sign(payload, SECRET, { expiresIn: EXP });
}


const out = { meta: { exp: EXP, enterprise_id: ENT, generatedAt: new Date().toISOString() }, tokens: {} };
for (const u of users) {
out.tokens[u.label] = signToken(u);
}


console.log(JSON.stringify(out, null, 2));


try {
const fname = `tokens-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
const fpath = path.join(process.cwd(), fname);
fs.writeFileSync(fpath, JSON.stringify(out, null, 2));
console.error(`✔ Tokens saved to ${fname}`);
} catch (e) {
console.error('! Could not write tokens file:', e.message);
}
