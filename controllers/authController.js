const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models"); // ton modèle Sequelize

// POST /api/login
exports.login = async (req, res) => {
  try {
    const { email, password, full_mobile, pin } = req.body;

    let user;

    // --- Mode email/password
    if (email && password) {
      user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Utilisateur introuvable" });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Mot de passe incorrect" });
      }
    }

    // --- Mode téléphone/pin
    else if (full_mobile && pin) {
      user = await User.findOne({ where: { full_mobile } });
      if (!user) {
        return res.status(401).json({ error: "Utilisateur introuvable" });
      }
      const valid = await bcrypt.compare(pin, user.pin_hash); // ⚠️ stocker les PINs hachés
      if (!valid) {
        return res.status(401).json({ error: "Code PIN incorrect" });
      }
    }

    else {
      return res.status(400).json({ error: "Champs manquants" });
    }

    // --- Génération token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_mobile: user.full_mobile,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Erreur login:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

