"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class License extends Model {
    static associate(models) {
      // Une licence appartient à une entreprise
      License.belongsTo(models.Enterprise, {
        foreignKey: "enterprise_id",
        as: "enterprise",
      });
    }
  }

  License.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      enterprise_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "enterprises",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      type: {
        type: DataTypes.ENUM("TRIAL", "MONTHLY", "ANNUAL"),
        allowNull: false,
        defaultValue: "TRIAL",
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      max_users: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
      },
      status: {
        type: DataTypes.ENUM("active", "expired", "suspended"),
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "License",
      tableName: "licenses",
      underscored: true, // created_at, updated_at
      timestamps: true,
    }
  );

  return License;
};

