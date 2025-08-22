// models/affiliateLink.js
// ---------------------------------------------------------------------
module.exports = (sequelize, DataTypes) => {
const AffiliateLink = sequelize.define('AffiliateLink', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
partner_id: { type: DataTypes.UUID, allowNull: false },
code: { type: DataTypes.STRING(64), allowNull: false, unique: true },
campaign: { type: DataTypes.STRING, allowNull: true },
metadata: { type: DataTypes.JSONB, allowNull: true }
}, {
tableName: 'affiliate_links',
timestamps: true,
indexes: [{ unique: true, fields: ['code'] }, { fields: ['partner_id'] }]
});
AffiliateLink.associate = (models) => {
AffiliateLink.belongsTo(models.AffiliatePartner, { foreignKey: 'partner_id', as: 'partner' });
};
return AffiliateLink;
};
