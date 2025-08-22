// generateAdminToken.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Charge la clé depuis .env ou Variables Railway
const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error("❌ JWT_SECRET manquant (ajoute-le dans tes variables d'env)");
  process.exit(1);
}

// Payload admin
const payload = {
  sub: "demo-admin-id",
  role: "PLATFORM_ADMIN",  // ⚡ important pour accéder aux routes admin
  enterprise_id: null
};

// Génère un token valable 24h
const token = jwt.sign(payload, secret, { expiresIn: "24h" });

console.log("✅ Token admin généré :\n");
console.log(token);

