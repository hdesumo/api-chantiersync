const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 👉 route /api/auth/login
router.post('/auth/login', authController.login);

module.exports = router;

