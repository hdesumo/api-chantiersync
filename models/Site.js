// models/Site.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Site', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    enterprise_id: { type: DataTypes.UUID, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING },
    lat: { type: DataTypes.FLOAT },
    lng: { type: DataTypes.FLOAT },
    status: { type: DataTypes.ENUM('active','paused','closed'), defaultValue: 'active' },
    start_date: { type: DataTypes.DATE },
    end_date: { type: DataTypes.DATE }
  }, { tableName: 'sites' });
};

