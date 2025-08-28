const { License } = require("../models");

// GET all licenses
exports.getAll = async (req, res) => {
  try {
    const licenses = await License.findAll({
      order: [["created_at", "DESC"]],
    });
    return res.json(licenses);
  } catch (error) {
    console.error("❌ Erreur SQL getAll:", error);
    return res.status(500).json({ error: "Impossible de récupérer les licenses" });
  }
};

// GET license by ID
exports.getById = async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id);
    if (!license) return res.status(404).json({ error: "License introuvable" });
    return res.json(license);
  } catch (error) {
    console.error("❌ Erreur SQL getById:", error);
    return res.status(500).json({ error: "Impossible de récupérer la license" });
  }
};

// CREATE license
exports.create = async (req, res) => {
  try {
    const { enterprise_id, type, start_date, end_date, max_users, status } = req.body;
    const newLicense = await License.create({
      enterprise_id,
      type,
      start_date,
      end_date,
      max_users,
      status,
    });
    return res.status(201).json(newLicense);
  } catch (error) {
    console.error("❌ Erreur SQL create:", error);
    return res.status(500).json({ error: "Impossible de créer la license" });
  }
};

// UPDATE license
exports.update = async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id);
    if (!license) return res.status(404).json({ error: "License introuvable" });

    await license.update(req.body);
    return res.json(license);
  } catch (error) {
    console.error("❌ Erreur SQL update:", error);
    return res.status(500).json({ error: "Impossible de mettre à jour la license" });
  }
};

// DELETE license
exports.remove = async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id);
    if (!license) return res.status(404).json({ error: "License introuvable" });

    await license.destroy();
    return res.json({ message: "License supprimée avec succès" });
  } catch (error) {
    console.error("❌ Erreur SQL delete:", error);
    return res.status(500).json({ error: "Impossible de supprimer la license" });
  }
};

