// routes/reportRoutes.js
'use strict';

const express = require('express');
const router = express.Router();

// Auth middleware
const { authMiddleware } = require('../middleware/auth');

// Controller
const reportController = require('../controllers/reportController');

// Garde-fou: si une méthode manque dans le controller, retourne 501 plutôt que planter Express
const ensure = (name) =>
  (typeof reportController?.[name] === 'function')
    ? reportController[name]
    : (_req, res) => res.status(501).json({ error: `Controller method ${name} not implemented` });

// GET /api/reports  → liste paginée (laisse ton controller gérer la forme {items:[], nextOffset} si c'est déjà le cas)
router.get('/reports', authMiddleware, ensure('list'));

// DELETE /api/reports/:reportId/attachments/:fileName  → suppression d’une pièce jointe
router.delete('/reports/:reportId/attachments/:fileName', authMiddleware, ensure('deleteAttachment'));

module.exports = router;

