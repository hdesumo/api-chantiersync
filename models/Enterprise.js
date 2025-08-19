// models/Enterprise.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Enterprise', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    plan: { type: DataTypes.ENUM('free', 'pro'), defaultValue: 'free' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'enterprises' });
};

