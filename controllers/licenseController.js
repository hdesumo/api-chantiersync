const { License } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const licenses = await License.findAll({ raw: true, order: [["createdAt", "DESC"]] });
    return res.json(licenses);
  } catch (err) {
    console.error("Erreur récupération licenses:", err);
    return res.status(500).json({ error: "Impossible de récupérer les licenses" });
  }
};

exports.getById = async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id, { raw: true });
    if (!license) return res.status(404).json({ error: "Licence introuvable" });
    return res.json(license);
  } catch (err) {
    console.error("Erreur récupération license:", err);
    return res.status(500).json({ error: "Impossible de récupérer la licence" });
  }
};

exports.create = async (req, res) => {
  try {
    const { enterprise_id, type, start_date, end_date, quota, status } = req.body;
    const license = await License.create({ enterprise_id, type, start_date, end_date, quota, status });
    return res.status(201).json(license);
  } catch (err) {
    console.error("Erreur création license:", err);
    return res.status(500).json({ error: "Impossible de créer la licence" });
  }
};

exports.update = async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id);
    if (!license) return res.status(404).json({ error: "Licence introuvable" });

    await license.update(req.body);
    return res.json(license);
  } catch (err) {
    console.error("Erreur mise à jour license:", err);
    return res.status(500).json({ error: "Impossible de mettre à jour la licence" });
  }
};

exports.remove = async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id);
    if (!license) return res.status(404).json({ error: "Licence introuvable" });

    await license.destroy();
    return res.json({ message: "Licence supprimée avec succès" });
  } catch (err) {
    console.error("Erreur suppression license:", err);
    return res.status(500).json({ error: "Impossible de supprimer la licence" });
  }
};

