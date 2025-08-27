"use strict";

module.exports = {
  async up(queryInterface) {
    // Ajout des rôles manquants dans l'ENUM Postgres
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'TENANT_ADMIN';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'MANAGER';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'AGENT';
    `);
  },

  async down() {
    // ⚠️ Pas de rollback simple possible pour ENUM dans Postgres
    console.warn("Rollback non supporté pour les ENUM Postgres");
  },
};

