module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("SUPERADMIN", "ADMIN", "SITE_MANAGER", "TENANT_ADMIN", "AGENT"),
      allowNull: false,
      defaultValue: "USER"
    },
    enterprise_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: "users",   // 👈 forcer minuscule
    underscored: true     // 👈 pour que Sequelize mappe created_at → createdAt
  });

  return User;
};

