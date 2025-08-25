'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [{
      id: Sequelize.literal('uuid_generate_v4()'),
      enterprise_id: Sequelize.literal('uuid_generate_v4()'), // fake enterprise pour le moment
      full_name: 'Super Admin',
      email: 'admin@example.com',
      phone: '+221770000000',
      role: 'SUPERADMIN',
      password_hash: passwordHash,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@example.com' });
  }
};

