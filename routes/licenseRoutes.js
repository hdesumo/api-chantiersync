const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/auth");
const licenseController = require("../controllers/licenseController");

// Récupérer toutes les licences
router.get("/", authMiddleware, requireRole("SUPERADMIN"), licenseController.getAll);

module.exports = router;

