// models/License.js
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
        type: DataTypes.ENUM("TRIAL", "MONTHLY", "ANNUAL"), // doit matcher DB
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      quota: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "expired", "suspended"), // doit matcher DB
        allowNull: false,
        defaultValue: "active",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "createdAt", // 👈 DB a bien createdAt, pas created_at
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "updatedAt",
      },
    },
    {
      tableName: "licenses", // 👈 assure Sequelize qu'il utilise la bonne table
      timestamps: true,
    }
  );

  return License;
};

