// routes/siteRoutes.js
const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/auth');
const siteController = require('../controllers/siteController');

// Liste paginée
router.get('/sites', authMiddleware, siteController.list);

// QR code PNG
router.get('/sites/:id/qr.png', authMiddleware, siteController.qr);

// Sonde légère SQL (debug)
router.get('/sites-probe', authMiddleware, siteController.probe);

module.exports = router;

