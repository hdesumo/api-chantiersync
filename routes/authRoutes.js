const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");

// ✅ la fonction existe bien
router.post("/login", login);

module.exports = router;

