'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Vérifie si l'entreprise existe déjà
    const [enterprise] = await queryInterface.sequelize.query(
      "SELECT id FROM enterprises WHERE slug = 'chantiersync-sa' LIMIT 1;"
    );

    let enterpriseId;
    if (enterprise.length === 0) {
      // Crée l'entreprise si elle n'existe pas
      const [result] = await queryInterface.sequelize.query(
        `INSERT INTO enterprises (id, name, slug, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), 'ChantierSync SA', 'chantiersync-sa', NOW(), NOW())
         RETURNING id;`
      );
      enterpriseId = result[0].id;
    } else {
      enterpriseId = enterprise[0].id;
    }

    // Vérifie si le superadmin existe déjà
    const [user] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1;"
    );

    if (user.length === 0) {
      // Crée le superadmin seulement s'il n'existe pas
      await queryInterface.bulkInsert('users', [{
        id: Sequelize.literal('gen_random_uuid()'),
        enterprise_id: enterpriseId,
        full_name: 'Super Admin',
        email: 'admin@example.com',
        role: 'SUPERADMIN',
        password_hash: passwordHash,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    } else {
      console.log('⚠️ Superadmin déjà existant, seed ignoré.');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@example.com' });
    await queryInterface.bulkDelete('enterprises', { slug: 'chantiersync-sa' });
  }
};

