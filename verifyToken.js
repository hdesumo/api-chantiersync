// verifyToken.js — Vérifier rapidement un JWT
// ==================================
// Usage:
// node verifyToken.js --token "<JWT>" --secret "..." # ou export JWT_SECRET


if (require.main === module && getArg('token')) {
// If called as: node genTokens.js --token ... we also verify inline
const token = getArg('token');
try {
const dec = jwt.verify(token, SECRET);
console.error('✔ Verify OK');
console.log(JSON.stringify(dec, null, 2));
} catch (e) {
console.error('✖ Verify failed:', e.message);
process.exit(2);
}
}
