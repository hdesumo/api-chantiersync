// migrations/20250829-add-slug-to-sites.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("sites", "slug", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      defaultValue: ""  // ⚠️ à ajuster selon ta logique
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("sites", "slug");
  }
};

