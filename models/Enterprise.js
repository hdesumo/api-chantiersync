// models/Enterprise.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Enterprise', {
    id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name:     { type: DataTypes.STRING, allowNull: false },
    slug:     { type: DataTypes.STRING, allowNull: false, unique: true },
    plan:     { type: DataTypes.ENUM('free', 'pro'), defaultValue: 'free' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },

    // nouveaux champs profil
    phone:    { type: DataTypes.STRING(64), allowNull: true },
    address:  { type: DataTypes.TEXT, allowNull: true },
    logo_url: { type: DataTypes.TEXT, allowNull: true },
    leaders:  { type: DataTypes.JSONB, allowNull: false, defaultValue: [] }
  }, {
    tableName: 'enterprises',
    underscored: true,
    timestamps: true
  });
};

