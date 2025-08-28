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
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
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
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      enterprise_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "tenant_id", // 👈 DB = tenant_id ; Sequelize = tenantId
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "users", // 👈 force minuscule
      timestamps: true,   // Sequelize gère createdAt / updatedAt (camelCase)
      // ❌ ne pas mettre underscored: true car ta DB utilise camelCase
    }
  );

  return User;
};

