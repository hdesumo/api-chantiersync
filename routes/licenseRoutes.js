const express = require("express");
const router = express.Router();
const { License, Enterprise } = require("../models");
const { authMiddleware, requireRole } = require("../middleware/auth");

// ✅ Lister toutes les licences (SuperAdmin only)
router.get("/", authMiddleware, requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const licenses = await License.findAll({
      include: [{ model: Enterprise, as: "enterprise", attributes: ["id", "name"] }],
    });
    res.json(licenses);
  } catch (err) {
    console.error("Erreur GET /licenses", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Voir une licence par ID
router.get("/:id", authMiddleware, requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id, {
      include: [{ model: Enterprise, as: "enterprise", attributes: ["id", "name"] }],
    });
    if (!license) return res.status(404).json({ error: "Licence introuvable" });
    res.json(license);
  } catch (err) {
    console.error("Erreur GET /licenses/:id", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Créer une licence
router.post("/", authMiddleware, requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const { enterprise_id, type, start_date, end_date, max_users, status } = req.body;
    const license = await License.create({
      enterprise_id,
      type,
      start_date,
      end_date,
      max_users,
      status,
    });
    res.status(201).json(license);
  } catch (err) {
    console.error("Erreur POST /licenses", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Mettre à jour une licence
router.put("/:id", authMiddleware, requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id);
    if (!license) return res.status(404).json({ error: "Licence introuvable" });

    await license.update(req.body);
    res.json(license);
  } catch (err) {
    console.error("Erreur PUT /licenses/:id", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Supprimer une licence
router.delete("/:id", authMiddleware, requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id);
    if (!license) return res.status(404).json({ error: "Licence introuvable" });

    await license.destroy();
    res.json({ message: "Licence supprimée" });
  } catch (err) {
    console.error("Erreur DELETE /licenses/:id", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;

