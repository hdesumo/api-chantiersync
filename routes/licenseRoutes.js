const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/auth");
const licenseController = require("../controllers/licenseController");

// Récupérer toutes les licences
router.get("/", authMiddleware, requireRole("SUPERADMIN"), licenseController.getAll);

// Récupérer une licence par ID
router.get("/:id", authMiddleware, requireRole("SUPERADMIN"), licenseController.getById);

// Créer une nouvelle licence
router.post("/", authMiddleware, requireRole("SUPERADMIN"), licenseController.create);

// Mettre à jour une licence
router.put("/:id", authMiddleware, requireRole("SUPERADMIN"), licenseController.update);

// Supprimer une licence
router.delete("/:id", authMiddleware, requireRole("SUPERADMIN"), licenseController.remove);

module.exports = router;

