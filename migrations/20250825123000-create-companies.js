'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false },
      phone: { type: Sequelize.STRING(64), allowNull: false },
      address: { type: Sequelize.TEXT, allowNull: true },
      logo_url: { type: Sequelize.TEXT, allowNull: true },
      leaders: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] }, // <— JSONB
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('companies', ['name']);
    await queryInterface.addIndex('companies', ['phone']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('companies');
  }
};

