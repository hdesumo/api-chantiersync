'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Crée une entreprise minimale
    await queryInterface.bulkInsert('enterprises', [{
      id: Sequelize.literal('gen_random_uuid()'),
      name: 'ChantierSync SA',
      slug: 'chantiersync-sa',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Récupère l’ID de l’entreprise
    const [results] = await queryInterface.sequelize.query(
      "SELECT id FROM enterprises WHERE slug = 'chantiersync-sa' LIMIT 1;"
    );
    const enterpriseRow = results[0];

    // Crée un superadmin lié à cette entreprise
    await queryInterface.bulkInsert('users', [{
      id: Sequelize.literal('gen_random_uuid()'),
      enterprise_id: enterpriseRow.id,
      full_name: 'Super Admin',
      email: 'admin@example.com',
      role: 'SUPERADMIN',
      password_hash: passwordHash,
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@example.com' });
    await queryInterface.bulkDelete('enterprises', { slug: 'chantiersync-sa' });
  }
};

