"use strict";

module.exports = (sequelize, DataTypes) => {
  const Enterprise = sequelize.define(
    "Enterprise",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      logo: {
        type: DataTypes.STRING,
      },
      directors: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "enterprises",
      underscored: true,
    }
  );

  Enterprise.associate = (models) => {
    // Un enterprise peut avoir plusieurs utilisateurs
    Enterprise.hasMany(models.User, {
      foreignKey: "enterprise_id",
      as: "users",
    });

    // Un enterprise peut avoir plusieurs sites
    Enterprise.hasMany(models.Site, {
      foreignKey: "enterprise_id",
      as: "sites",
    });

    // Un enterprise peut avoir plusieurs rapports (via sites)
    Enterprise.hasMany(models.Report, {
      foreignKey: "enterprise_id",
      as: "reports",
    });

    // Une seule licence liée à l’entreprise
    Enterprise.hasOne(models.License, {
      foreignKey: "enterprise_id",
      as: "license",
      onDelete: "CASCADE",
    });
  };

  return Enterprise;
};

