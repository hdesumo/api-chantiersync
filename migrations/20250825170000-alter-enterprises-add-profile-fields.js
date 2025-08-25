'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('enterprises', 'phone',    { type: Sequelize.STRING(64), allowNull: true });
    await queryInterface.addColumn('enterprises', 'address',  { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('enterprises', 'logo_url', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('enterprises', 'leaders',  { type: Sequelize.JSONB, allowNull: false, defaultValue: [] });

    await queryInterface.addIndex('enterprises', ['name']);
    await queryInterface.addIndex('enterprises', ['phone']);
    await queryInterface.addIndex('enterprises', ['slug'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('enterprises', 'leaders');
    await queryInterface.removeColumn('enterprises', 'logo_url');
    await queryInterface.removeColumn('enterprises', 'address');
    await queryInterface.removeColumn('enterprises', 'phone');
  }
};

