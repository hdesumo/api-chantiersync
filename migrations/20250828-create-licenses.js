"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Extension UUID
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryInterface.createTable("licenses", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
      },
      enterprise_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "enterprises",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      type: {
        type: Sequelize.ENUM("TRIAL", "MONTHLY", "ANNUAL"),
        allowNull: false,
        defaultValue: "TRIAL",
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      max_users: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      },
      status: {
        type: Sequelize.ENUM("active", "expired", "suspended"),
        defaultValue: "active",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    // Supprimer d'abord la table
    await queryInterface.dropTable("licenses");

    // Ensuite supprimer les ENUM
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_licenses_type";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_licenses_status";`);
  },
};

