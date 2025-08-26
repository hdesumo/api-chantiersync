'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '$2b$10$CwTycUXWue0Thq9StjUM0uJ8YJ0lA12rRW5e4oPj6t2uoEuewT9kK' // hash de "admin123"
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'password');
  }
};

