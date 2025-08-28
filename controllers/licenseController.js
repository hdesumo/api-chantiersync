const { License } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const licenses = await License.findAll({
      raw: true, // renvoie des objets simples
      order: [["createdAt", "DESC"]],
    });

    return res.json(licenses);
  } catch (err) {
    console.error("Erreur SQL getAll:", err);
    return res.status(500).json({ error: "Impossible de récupérer les licenses" });
  }
};

