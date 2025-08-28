// controllers/licenseController.js
const { License } = require("../models");

// Récupérer toutes les licenses
async function getAll(req, res) {
  try {
    const licenses = await License.findAll();
    return res.json(licenses);
  } catch (err) {
    console.error("Erreur getAll:", err);
    return res.status(500).json({ error: "Impossible de récupérer les licenses" });
  }
}

// Créer une nouvelle license
async function create(req, res) {
  try {
    const { key, tenantId } = req.body;
    const license = await License.create({ key, tenantId });
    return res.status(201).json(license);
  } catch (err) {
    console.error("Erreur create:", err);
    return res.status(500).json({ error: "Impossible de créer la license" });
  }
}

// Supprimer une license
async function remove(req, res) {
  try {
    const { id } = req.params;
    await License.destroy({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    console.error("Erreur remove:", err);
    return res.status(500).json({ error: "Impossible de supprimer la license" });
  }
}

module.exports = { getAll, create, remove };

