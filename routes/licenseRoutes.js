const express = require("express");
const router = express.Router();
const { License, Enterprise, User } = require("../models");
const { authMiddleware } = require("../middleware/auth");

// ✅ SuperAdmin : voir toutes les licences
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const licenses = await License.findAll({
      include: [{ model: Enterprise, as: "enterprise" }],
    });
    res.json(licenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch licenses" });
  }
});

// ✅ TenantAdmin : voir sa propre licence
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "TENANTADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // On récupère l'entreprise de l’admin connecté
    const user = await User.findByPk(req.user.id);
    if (!user || !user.enterprise_id) {
      return res.status(404).json({ error: "Enterprise not found" });
    }

    const license = await License.findOne({
      where: { enterprise_id: user.enterprise_id },
      include: [{ model: Enterprise, as: "enterprise" }],
      order: [["created_at", "DESC"]],
    });

    if (!license) {
      return res.status(404).json({ error: "No license found for this enterprise" });
    }

    res.json(license);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch license" });
  }
});

// ✅ SuperAdmin : renouveler une licence
router.post("/:id/renew", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const license = await License.findByPk(req.params.id);
    if (!license) {
      return res.status(404).json({ error: "License not found" });
    }

    const endDate = new Date(license.end_date);
    endDate.setFullYear(endDate.getFullYear() + 1);

    license.end_date = endDate;
    license.status = "active";
    await license.save();

    res.json({ message: "License renewed successfully", license });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to renew license" });
  }
});

module.exports = router;

