// routes/licenseRoutes.js
const express = require("express");
const router = express.Router();
const licenseController = require("../controllers/licenseController");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET all licenses
router.get(
  "/",
  authMiddleware,
  requireRole("SUPERADMIN"),
  licenseController.getAll
);

// GET license by ID
router.get(
  "/:id",
  authMiddleware,
  requireRole("SUPERADMIN"),
  licenseController.getById
);

// CREATE license
router.post(
  "/",
  authMiddleware,
  requireRole("SUPERADMIN"),
  licenseController.create
);

// UPDATE license
router.put(
  "/:id",
  authMiddleware,
  requireRole("SUPERADMIN"),
  licenseController.update
);

// DELETE license
router.delete(
  "/:id",
  authMiddleware,
  requireRole("SUPERADMIN"),
  licenseController.remove
);

module.exports = router;

