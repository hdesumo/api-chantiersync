const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ✅ toutes les routes auth sous /api/auth
router.post("/login", authController.login);
router.post("/register", authController.register);

module.exports = router; // ⚡ bien exporter directement le router

