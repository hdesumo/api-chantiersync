// controllers/licenseController.js
const { License } = require("../models");

exports.listLicenses = async (req, res) => {
  try {
    const licenses = await License.findAll();
    res.json(licenses);
  } catch (err) {
    console.error("❌ Error listing licenses:", err);
    res.status(500).json({ error: "Failed to list licenses" });
  }
};

exports.createLicense = async (req, res) => {
  try {
    const license = await License.create(req.body);
    res.status(201).json(license);
  } catch (err) {
    console.error("❌ Error creating license:", err);
    res.status(500).json({ error: "Failed to create license" });
  }
};

exports.getMyLicenses = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const licenses = await License.findAll({ where: { userId } });
    res.json(licenses);
  } catch (err) {
    console.error("❌ Error fetching user licenses:", err);
    res.status(500).json({ error: "Failed to fetch user licenses" });
  }
};

