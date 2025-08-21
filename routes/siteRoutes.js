// routes/siteRoutes.js
const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/auth');
const siteController = require('../controllers/siteController');

// Liste paginée des sites
router.get('/sites', authMiddleware, siteController.list);

// QR code PNG d’un site
router.get('/sites/:id/qr.png', authMiddleware, siteController.qr);

// Sonde SQL (debug)
router.get('/sites-probe', authMiddleware, siteController.probe);

module.exports = router;

