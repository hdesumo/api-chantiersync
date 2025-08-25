'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    // dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  });
} else {
  const allCfg = require(path.join(__dirname, '..', 'config', 'config.js'));
  const cfg = allCfg[env];
  sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, cfg);
}

const db = {};

// Charge tous les modèles *.js du dossier, sauf index.js
fs.readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.endsWith('.js'))
  .forEach((file) => {
    const modelFactory = require(path.join(__dirname, file));
    if (typeof modelFactory === 'function') {
      const model = modelFactory(sequelize, DataTypes);
      if (model && model.name) {
        db[model.name] = model;
      }
    }
  });

// Déclare les associations
Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// Alias utile
if (!db.Tenant && db.Enterprise) {
  db.Tenant = db.Enterprise;
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.syncAll = async (opts = {}) => {
  await sequelize.sync(opts);
};

module.exports = db;

