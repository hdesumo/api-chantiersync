// models/affiliate.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Affiliate extends Model {
    static associate(models) {
      Affiliate.hasMany(models.AffiliateClick, { foreignKey: 'affiliate_id' });
      Affiliate.hasMany(models.AffiliateLead, { foreignKey: 'affiliate_id' });
      Affiliate.hasMany(models.AffiliateCommission, { foreignKey: 'affiliate_id' });
      // Optionnel: lien vers User si on veut un login natif d’affilié
      // Affiliate.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  Affiliate.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      code: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      rate: { type: DataTypes.DECIMAL(5, 4), allowNull: false, defaultValue: 0.2000 }, // 0.2 = 20%
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EUR' },
      status: { type: DataTypes.ENUM('active', 'paused', 'blocked'), defaultValue: 'active' },
      notes: { type: DataTypes.TEXT, allowNull: true },
      // user_id: { type: DataTypes.UUID, allowNull: true }, // si on rattache à un user
    },
    {
      sequelize,
      modelName: 'Affiliate',
      tableName: 'affiliates',
      timestamps: true,
      underscored: false,
    }
  );

  return Affiliate;
};

