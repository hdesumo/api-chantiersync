const express = require("express");
const { body, param, query } = require("express-validator");
const licenseController = require("../controllers/licenseController");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const licenseValidation = [
  body("enterprise_id").isUUID().withMessage("enterprise_id doit être un UUID valide"),
  body("type").isIn(["TRIAL", "MONTHLY", "ANNUAL"]).withMessage("type invalide"),
  body("start_date").isISO8601().toDate().withMessage("start_date doit être une date valide"),
  body("end_date").isISO8601().toDate().withMessage("end_date doit être une date valide"),
  body("max_users").isInt({ min: 1 }).withMessage("max_users doit être un entier positif"),
  body("status").isIn(["active", "expired", "suspended"]).withMessage("status invalide")
];

// CRUD
router.get("/", authMiddleware, requireRole("SUPERADMIN"), licenseController.getAll);

router.get(
  "/:id",
  authMiddleware,
  requireRole("SUPERADMIN"),
  param("id").isUUID().withMessage("ID invalide"),
  licenseController.getById
);

router.post("/", authMiddleware, requireRole("SUPERADMIN"), licenseValidation, licenseController.create);

router.put("/:id", authMiddleware, requireRole("SUPERADMIN"), licenseValidation, licenseController.update);

router.delete("/:id", authMiddleware, requireRole("SUPERADMIN"), param("id").isUUID(), licenseController.remove);

module.exports = router;

