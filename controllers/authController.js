// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize, User, Enterprise } = require('../models');
const { markConversion } = require('../middleware/attribution');

// Génère un slug simple depuis le nom entreprise
function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email et password requis' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });

    const token = jwt.sign(
      { uid: user.id, role: user.role, enterprise_id: user.enterprise_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        enterprise: user.enterprise_id || null,
      },
    });
  } catch (err) {
    console.error('login failed:', err);
    return res.status(500).json({ error: 'Login impossible' });
  }
}

// Création d’un tenant (entreprise + user TENANT_ADMIN) puis conversion aff si lead
async function registerTenant(req, res) {
  const t = await sequelize.transaction();
  try {
    const { enterpriseName, name, email, password } = req.body || {};
    if (!enterpriseName || !name || !email || !password) {
      await t.rollback();
      return res.status(400).json({ error: 'enterpriseName, name, email, password requis' });
    }

    const exists = await User.findOne({ where: { email }, transaction: t });
    if (exists) {
      await t.rollback();
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }

    // Crée l’entreprise (tenant)
    const ent = await Enterprise.create(
      {
        name: enterpriseName,
        slug: slugify(enterpriseName),
        // autres champs selon votre modèle…
      },
      { transaction: t }
    );

    // Crée l’admin du tenant
    const passHash = await bcrypt.hash(password, 10);
    const user = await User.create(
      {
        name,
        email,
        password_hash: passHash,
        role: 'TENANT_ADMIN',
        enterprise_id: ent.id,
      },
      { transaction: t }
    );

    await t.commit();

    // JWT de connexion immédiate
    const token = jwt.sign(
      { uid: user.id, role: user.role, enterprise_id: ent.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // Si un lead a été capturé par le middleware, on marque la conversion
    const leadId = req.attribution?.leadId;
    if (leadId) {
      await markConversion(leadId, { tenant_id: ent.id, user_id: user.id });
    }

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, role: user.role, enterprise: ent.slug },
    });
  } catch (err) {
    console.error('registerTenant failed:', err);
    try { await t.rollback(); } catch {}
    return res.status(500).json({ error: 'Création du compte impossible' });
  }
}

module.exports = {
  login,
  registerTenant,
};

