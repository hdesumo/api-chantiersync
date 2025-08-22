// models/affiliateClick.js
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AffiliateClick extends Model {
    static associate(models) {
      AffiliateClick.belongsTo(models.Affiliate, { foreignKey: 'affiliate_id' });
    }
  }

  AffiliateClick.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      affiliate_id: { type: DataTypes.UUID, allowNull: false },
      ip: { type: DataTypes.STRING(64) },
      ua: { type: DataTypes.TEXT },
      landing_path: { type: DataTypes.STRING(512) },
    },
    {
      sequelize,
      modelName: 'AffiliateClick',
      tableName: 'affiliate_clicks',
      timestamps: true,
    }
  );

  return AffiliateClick;
};

