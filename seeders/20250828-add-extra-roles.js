module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajoute TENANT_ADMIN si non présent
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role"
      ADD VALUE IF NOT EXISTS 'TENANT_ADMIN';
    `);

    // Ajoute AGENT si non présent
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role"
      ADD VALUE IF NOT EXISTS 'AGENT';
    `);

    // Ajoute PASSENGER si tu en as besoin
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role"
      ADD VALUE IF NOT EXISTS 'PASSENGER';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // ⚠️ PostgreSQL n’autorise pas de retirer une valeur d’ENUM facilement
    // Pour rollback, il faudrait recréer le type → on laisse vide
  }
};

