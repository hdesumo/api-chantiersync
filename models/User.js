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
      type: DataTypes.ENUM(
        "SUPERADMIN",
        "ADMIN",
        "SITE_MANAGER",
        "TENANT_ADMIN",
        "AGENT"
      ),
      allowNull: false
    },
    enterprise_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    tenantId: {                          // 👈 important : camelCase
      type: DataTypes.UUID,
      allowNull: true,
      field: "tenantId"                  // 👈 force Sequelize à utiliser tenantId (et pas tenant_id)
    }
  }, {
    tableName: "users",                  // 👈 force minuscule
    timestamps: true
  });

  return User;
};

