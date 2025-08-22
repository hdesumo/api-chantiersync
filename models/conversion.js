// models/conversion.js (signup OK)
// ---------------------------------------------------------------------
module.exports = (sequelize, DataTypes) => {
const Conversion = sequelize.define('Conversion', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
tenant_id: { type: DataTypes.UUID, allowNull: false },
enterprise_id: { type: DataTypes.UUID, allowNull: true },
user_id: { type: DataTypes.UUID, allowNull: true },
affiliate_code: { type: DataTypes.STRING(64), allowNull: true },
converted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
tableName: 'conversions',
timestamps: true,
indexes: [{ fields: ['affiliate_code'] }, { fields: ['tenant_id'] }]
});
return Conversion;
};
