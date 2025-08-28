// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(
          "SUPERADMIN",
          "ADMIN",
          "SITE_MANAGER",
          "TENANT_ADMIN",
          "AGENT"
        ),
        allowNull: false,
        defaultValue: "ADMIN",
      },
      enterprise_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "tenant_id", // 👈 DB = tenant_id, Sequelize expose tenantId
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "updated_at",
      },
    },
    {
      tableName: "users",  // 👈 force le nom minuscule
      underscored: true,   // 👈 mappe created_at / updated_at
    }
  );

  return User;
};

// force rebuild Jeu 28 aoû 2025 05:42:11 CEST
