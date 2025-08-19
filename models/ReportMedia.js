// models/ReportMedia.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ReportMedia', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    report_id: { type: DataTypes.UUID, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false },
    mime_type: { type: DataTypes.STRING },
    size: { type: DataTypes.INTEGER },
    meta: { type: DataTypes.JSONB }
  }, { tableName: 'report_media' });
};

