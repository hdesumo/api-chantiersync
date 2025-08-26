"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Extension UUID si pas encore activée
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryInterface.createTable("licenses", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        allowNull: false,
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
        onUpdate: "CASCADE",
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "ANNUAL", // "ANNUAL", "MONTHLY", "TRIAL"
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      max_users: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "active", // "active", "expired", "suspended"
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("licenses");
  },
};

