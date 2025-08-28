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
        type: DataTypes.ENUM("TRIAL", "MONTHLY", "ANNUAL"), // enum_licenses_type
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
      max_users: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "expired", "suspended"), // enum_licenses_status
        allowNull: false,
        defaultValue: "active",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at", // mappe la colonne snake_case
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "updated_at",
      },
    },
    {
      tableName: "licenses",
      timestamps: true,
    }
  );

  return License;
};

