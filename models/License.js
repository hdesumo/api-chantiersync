"use strict";

module.exports = (sequelize, DataTypes) => {
  const License = sequelize.define(
    "License",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      enterprise_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "ANNUAL", // "ANNUAL", "MONTHLY", "TRIAL"
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      max_users: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active", // "active", "expired", "suspended"
      },
    },
    {
      tableName: "licenses",
      underscored: true,
    }
  );

  License.associate = (models) => {
    // Une licence appartient à une entreprise
    License.belongsTo(models.Enterprise, {
      foreignKey: "enterprise_id",
      as: "enterprise",
      onDelete: "CASCADE",
    });
  };

  return License;
};

