// models/Report.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Report', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    enterprise_id: { type: DataTypes.UUID, allowNull: false },
    site_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.ENUM('incident','progress','quality','safety'), allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    priority: { type: DataTypes.ENUM('low','medium','high'), defaultValue: 'medium' },
    location: { type: DataTypes.STRING },
    client_ts: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('open','resolved'), defaultValue: 'open' },
    sync_status: { type: DataTypes.ENUM('pending','synced','failed'), defaultValue: 'synced' }
  }, { tableName: 'reports' });
};

