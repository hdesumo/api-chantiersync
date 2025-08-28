const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/auth");
const licenseController = require("../controllers/licenseController");

// ✅ Liste toutes les licences (SuperAdmin uniquement)
router.get("/", authMiddleware, requireRole("SUPERADMIN"), licenseController.getAll);

// ✅ Licence de l'entreprise du tenant
router.get("/mine", authMiddleware, requireRole("TENANT_ADMIN"), licenseController.getMine);

// ✅ Renouveler une licence (SuperAdmin uniquement)
router.post("/renew/:id", authMiddleware, requireRole("SUPERADMIN"), licenseController.renew);

module.exports = router; // ⚡ bien exporter directement le router

