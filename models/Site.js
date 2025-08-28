// models/Site.js
module.exports = (sequelize, DataTypes) => {
  const Site = sequelize.define(
    'Site',
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
      address: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
        slug: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
      // scoping métier par enterprise_id (tenant)
      enterprise_id: {
        type: DataTypes.UUID,
        allowNull: true, // passe à false si tu imposes le scoping strict
        // references: { model: 'tenants', key: 'id' }, // active si tu veux la contrainte FK
        // onDelete: 'SET NULL',
        // onUpdate: 'CASCADE',
      },
    },
    {
      tableName: 'sites',
      timestamps: true,
      underscored: false,
    }
  );

  Site.associate = (models) => {
    // Site.belongsTo(models.Tenant, { foreignKey: 'enterprise_id' });
  };

  return Site;
};

