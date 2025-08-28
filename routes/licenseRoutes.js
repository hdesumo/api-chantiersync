// routes/licenseRoutes.js
const express = require("express");
const router = express.Router();

const licenseController = require("../controllers/licenseController");
const { authMiddleware, requireRole } = require("../middleware/auth.js");

// 🔍 Debug log pour vérifier en prod
console.log("✅ requireRole chargé :", typeof requireRole);

// Liste toutes les licenses (réservé SUPERADMIN)
router.get(
  "/",
  authMiddleware,
  requireRole("SUPERADMIN"),
  licenseController.getAll
);

// Crée une nouvelle license (réservé SUPERADMIN)
router.post(
  "/",
  authMiddleware,
  requireRole("SUPERADMIN"),
  licenseController.create
);

// Supprime une license (réservé SUPERADMIN)
router.delete(
  "/:id",
  authMiddleware,
  requireRole("SUPERADMIN"),
  licenseController.remove
);

module.exports = router;

