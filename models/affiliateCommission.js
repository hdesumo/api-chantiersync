// models/affiliateCommission.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AffiliateCommission extends Model {
    static associate(models) {
      AffiliateCommission.belongsTo(models.Affiliate, { foreignKey: 'affiliate_id' });
      // Optionnel: relier à invoices/subscriptions si vous avez ces tables
      // AffiliateCommission.belongsTo(models.Subscription, { foreignKey: 'subscription_id' });
    }
  }

  AffiliateCommission.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      affiliate_id: { type: DataTypes.UUID, allowNull: false },
      enterprise_id: { type: DataTypes.UUID, allowNull: false },
      // montant de la commission (majoritairement % de l’ARR ou de l’invoice)
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EUR' },
      rate: { type: DataTypes.DECIMAL(5, 4), allowNull: false }, // taux utilisé pour le calcul
      period: { type: DataTypes.STRING(7) }, // ex: "2025-08"
      status: { type: DataTypes.ENUM('pending', 'approved', 'paid', 'void'), defaultValue: 'pending' },
      note: { type: DataTypes.TEXT },
    },
    {
      sequelize,
      modelName: 'AffiliateCommission',
      tableName: 'affiliate_commissions',
      timestamps: true,
    }
  );

  return AffiliateCommission;
};

