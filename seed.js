// seed.js — crée un tenant & un admin si la DB est vide
const bcrypt = require('bcryptjs');
const { Enterprise, User } = require('./models');

exports.seedIfEmpty = async () => {
  const count = await Enterprise.count();
  if (count > 0) return;
  const ent = await Enterprise.create({ name: 'ChantierSync Demo', slug: 'demo', plan: 'pro' });
  const hash = await bcrypt.hash('admin123', 10);
  await User.create({
    enterprise_id: ent.id, full_name: 'Admin Demo', email: 'admin@demo.local',
    role: 'ADMIN', password_hash: hash, is_active: true
  });
  // SUPERADMIN de plateforme (hors tenant) si besoin ultérieur
  /* ... */
  // eslint-disable-next-line no-console
  console.log('✅ Seeded: tenant demo / admin@demo.local / admin123');
};

