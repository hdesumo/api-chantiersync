// controllers/licenseController.js
const { validationResult } = require("express-validator");
const License = require("../models/License");

/**
 * GET /api/licenses
 * Récupérer toutes les licenses
 */
exports.getAll = async (req, res) => {
  try {
    const licenses = await License.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.json(licenses);
  } catch (err) {
    console.error("Erreur SQL getAll:", err);
    return res.status(500).json({ error: "Impossible de récupérer les licenses" });
  }
};

/**
 * GET /api/licenses/:id
 * Récupérer une license par ID
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const license = await License.findByPk(id);

    if (!license) {
      return res.status(404).json({ error: "License introuvable" });
    }

    return res.json(license);
  } catch (err) {
    console.error("Erreur SQL getById:", err);
    return res.status(500).json({ error: "Impossible de récupérer la license" });
  }
};

/**
 * POST /api/licenses
 * Créer une nouvelle license
 */
exports.create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const license = await License.create(req.body);
    return res.status(201).json(license);
  } catch (err) {
    console.error("Erreur SQL create:", err);
    return res.status(500).json({ error: "Impossible de créer la license" });
  }
};

/**
 * PUT /api/licenses/:id
 * Mettre à jour une license existante
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const license = await License.findByPk(id);

    if (!license) {
      return res.status(404).json({ error: "License introuvable" });
    }

    await license.update(req.body);
    return res.json(license);
  } catch (err) {
    console.error("Erreur SQL update:", err);
    return res.status(500).json({ error: "Impossible de mettre à jour la license" });
  }
};

/**
 * DELETE /api/licenses/:id
 * Supprimer une license
 */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const license = await License.findByPk(id);

    if (!license) {
      return res.status(404).json({ error: "License introuvable" });
    }

    await license.destroy();
    return res.json({ message: "License supprimée avec succès" });
  } catch (err) {
    console.error("Erreur SQL delete:", err);
    return res.status(500).json({ error: "Impossible de supprimer la license" });
  }
};

