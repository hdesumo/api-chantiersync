// controllers/licenseController.js
const { License } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const licenses = await License.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.json(licenses);
  } catch (err) {
    console.error("Erreur récupération licenses:", err);
    return res.status(500).json({ error: "Impossible de récupérer les licenses" });
  }
};

