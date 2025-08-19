// models/index.js
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Enterprise = require('./Enterprise')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const Site = require('./Site')(sequelize, DataTypes);
const Report = require('./Report')(sequelize, DataTypes);
const ReportMedia = require('./ReportMedia')(sequelize, DataTypes);

// Associations
Enterprise.hasMany(User, { foreignKey: 'enterprise_id' });
User.belongsTo(Enterprise, { foreignKey: 'enterprise_id' });

Enterprise.hasMany(Site, { foreignKey: 'enterprise_id' });
Site.belongsTo(Enterprise, { foreignKey: 'enterprise_id' });

Enterprise.hasMany(Report, { foreignKey: 'enterprise_id' });
Report.belongsTo(Enterprise, { foreignKey: 'enterprise_id' });

Site.hasMany(Report, { foreignKey: 'site_id' });
Report.belongsTo(Site, { foreignKey: 'site_id' });

User.hasMany(Report, { foreignKey: 'user_id' });
Report.belongsTo(User, { foreignKey: 'user_id' });

Report.hasMany(ReportMedia, { foreignKey: 'report_id' });
ReportMedia.belongsTo(Report, { foreignKey: 'report_id' });

module.exports = {
  sequelize, Enterprise, User, Site, Report, ReportMedia,
  syncAll: async () => { await sequelize.sync(); }
};

