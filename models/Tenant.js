// models/Tenant.js
module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define(
    'Tenant',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      domain: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: false, // passe à true si tu veux l’unicité
      },
      suspended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'tenants',
      timestamps: true,
      underscored: false,
    }
  );

  // associations (optionnel)
  Tenant.associate = (models) => {
    // Tenant.hasMany(models.Site, { foreignKey: 'enterprise_id' });
  };

  return Tenant;
};

