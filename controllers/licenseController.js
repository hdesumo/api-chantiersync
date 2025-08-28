const { License } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const licenses = await License.findAll({ order: [["createdAt", "DESC"]] });
    res.json(licenses);
  } catch (err) {
    console.error("Erreur SQL getAll:", err);
    res.status(500).json({ error: "Impossible de récupérer les licenses" });
  }
};

exports.getById = async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id);
    if (!license) return res.status(404).json({ error: "License non trouvée" });
    res.json(license);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.create = async (req, res) => {
  try {
    const license = await License.create(req.body);
    res.status(201).json(license);
  } catch (err) {
    res.status(500).json({ error: "Impossible de créer la license" });
  }
};

exports.update = async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id);
    if (!license) return res.status(404).json({ error: "License non trouvée" });

    await license.update(req.body);
    res.json(license);
  } catch (err) {
    res.status(500).json({ error: "Impossible de mettre à jour la license" });
  }
};

exports.remove = async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id);
    if (!license) return res.status(404).json({ error: "License non trouvée" });

    await license.destroy();
    res.json({ message: "License supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ error: "Impossible de supprimer la license" });
  }
};

