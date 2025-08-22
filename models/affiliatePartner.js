// models/affiliatePartner.js
// ---------------------------------------------------------------------
module.exports = (sequelize, DataTypes) => {
const AffiliatePartner = sequelize.define('AffiliatePartner', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
name: { type: DataTypes.STRING, allowNull: false },
email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
status: { type: DataTypes.ENUM('active','paused','disabled'), defaultValue: 'active' },
notes: { type: DataTypes.TEXT, allowNull: true },
}, {
tableName: 'affiliate_partners',
timestamps: true,
indexes: [{ fields: ['status'] }, { fields: ['email'] }]
});
AffiliatePartner.associate = (models) => {
AffiliatePartner.hasMany(models.AffiliateLink, { foreignKey: 'partner_id', as: 'links' });
};
return AffiliatePartner;
};
