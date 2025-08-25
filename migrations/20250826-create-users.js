'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      enterprise_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'enterprises', key: 'id' },
        onDelete: 'CASCADE'
      },
      full_name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      phone: { type: Sequelize.STRING },
      role: {
        type: Sequelize.ENUM('SUPERADMIN','ADMIN','SITE_MANAGER'),
        allowNull: false,
        defaultValue: 'ADMIN'
      },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};

