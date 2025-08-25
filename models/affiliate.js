'use strict';

module.exports = (sequelize, DataTypes) => {
  const Affiliate = sequelize.define('Affiliate', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    rate: { type: DataTypes.DECIMAL(5, 4), allowNull: false, defaultValue: 0.2000 }, // 20%
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EUR' },
    status: { type: DataTypes.ENUM('active', 'paused', 'blocked'), defaultValue: 'active' },
    notes: { type: DataTypes.TEXT, allowNull: true }
    // user_id: { type: DataTypes.UUID, allowNull: true }, // si rattaché à un user
  }, {
    tableName: 'affiliates',
    timestamps: true
  });

  Affiliate.associate = (models) => {
    // Ces modèles doivent exister si tu veux garder ces relations :
    if (models.AffiliateClick) {
      Affiliate.hasMany(models.AffiliateClick, { foreignKey: 'affiliate_id' });
    }
    if (models.AffiliateLead) {
      Affiliate.hasMany(models.AffiliateLead, { foreignKey: 'affiliate_id' });
    }
    if (models.AffiliateCommission) {
      Affiliate.hasMany(models.AffiliateCommission, { foreignKey: 'affiliate_id' });
    }
    // Exemple si tu veux relier à User :
    // if (models.User) {
    //   Affiliate.belongsTo(models.User, { foreignKey: 'user_id' });
    // }
  };

  return Affiliate;
};

