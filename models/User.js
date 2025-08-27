// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("SUPERADMIN", "TENANT_ADMIN", "MANAGER", "AGENT"),
      defaultValue: "TENANT_ADMIN",
    },
  });

  User.associate = (models) => {
    // Exemple : un user appartient à un tenant
    User.belongsTo(models.Tenant, {
      foreignKey: "tenantId",
      as: "tenant",
    });
  };

  return User;
};

