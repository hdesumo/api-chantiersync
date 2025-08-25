const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// --- stockage local (à remplacer par S3, etc. en prod)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), "uploads/logos")),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// TODO: protège avec authMiddleware
router.post("/api/companies", upload.single("logo"), async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    // leaders peut arriver en tableau ou en objets indexés (leaders[0], leaders[1]…)
    let leaders = [];
    if (Array.isArray(req.body.leaders)) {
      leaders = req.body.leaders;
    } else {
      // transforme leaders[0], leaders[1]... -> array
      leaders = Object.keys(req.body)
        .filter((k) => k.startsWith("leaders["))
        .sort((a, b) => {
          const ai = Number(a.match(/\[(\d+)\]/)?.[1] ?? 0);
          const bi = Number(b.match(/\[(\d+)\]/)?.[1] ?? 0);
          return ai - bi;
        })
        .map((k) => req.body[k])
        .filter(Boolean);
    }

    // fichier
    const logoPath = req.file ? `/uploads/logos/${req.file.filename}` : null;

    // TODO: insert en base (ex: Sequelize)
    // const company = await Company.create({
    //   name,
    //   phone,
    //   address,
    //   logo_url: logoPath,
    //   leaders, // en JSONB dans Postgres par ex.
    // });

    // Réponse de démo:
    return res.status(201).json({
      ok: true,
      // company,
      preview: { name, phone, address, leaders, logo_url: logoPath },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/api/companies", async (_req, res) => {
  // TODO: renvoyer la vraie liste depuis la DB
  // const items = await Company.findAll({ order: [["id", "DESC"]] });
  res.json({ items: [] });
});

module.exports = router;

