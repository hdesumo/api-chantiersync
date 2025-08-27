const express = require("express");
const router = express.Router();
const { Enterprise, License } = require("../models");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

// ✅ Créer une nouvelle entreprise
router.post("/", authMiddleware, requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const { name, logo, address, phone, manager_name } = req.body;

    // Création de l'entreprise
    const enterprise = await Enterprise.create({
      id: uuidv4(),
      name,
      logo,
      address,
      phone,
      manager_name,
    });

    // ✅ Création auto d'une licence TRIAL
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 14); // +14 jours

    await License.create({
      enterprise_id: enterprise.id,
      type: "TRIAL",
      start_date: startDate,
      end_date: endDate,
      max_users: 5,
      status: "active",
    });

    res.status(201).json({
      message: "Entreprise et licence TRIAL créées avec succès",
      enterprise,
    });
  } catch (err) {
    console.error("Erreur création entreprise:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Lister toutes les entreprises (SuperAdmin)
router.get("/", authMiddleware, requireRole("SUPERADMIN"), async (req, res) => {
  try {
    const enterprises = await Enterprise.findAll({
      include: [{ model: License, as: "licenses" }],
    });
    res.json(enterprises);
  } catch (err) {
    console.error("Erreur GET enterprises", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;

