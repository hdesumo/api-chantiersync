'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sites', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(512),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      enterprise_id: {
        type: Sequelize.UUID,
        allowNull: true,
        // Si tu veux activer la contrainte FK, dé-commente :
        // references: { model: 'tenants', key: 'id' },
        // onDelete: 'SET NULL',
        // onUpdate: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    // Index utile pour les filtres par tenant
    await queryInterface.addIndex('sites', ['enterprise_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sites');
  }
};

