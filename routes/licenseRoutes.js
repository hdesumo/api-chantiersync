const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const licenseController = require("../controllers/licenseController");

// Route accessible à tout utilisateur connecté
router.get("/", auth(), licenseController.listLicenses);

// Route accessible uniquement au SUPERADMIN
router.post("/create", auth(["SUPERADMIN"]), licenseController.createLicense);

router.get("/mine", auth(), licenseController.getMyLicenses);

module.exports = router;

