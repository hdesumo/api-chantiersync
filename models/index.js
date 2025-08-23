'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Priorité à DATABASE_URL (Railway), sinon fallback sur config/config.js
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    // Si tu utilises SSL côté Railway, décommente :
    // dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  });
} else {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const allCfg = require(path.join(__dirname, '..', 'config', 'config.js'));
  const cfg = allCfg[env];
  sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, cfg);
}

const db = {};

// Charge tous les modèles *.js du dossier, sauf index.js
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.endsWith('.js')
    );
  })
  .forEach((file) => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const modelFactory = require(path.join(__dirname, file));
    if (typeof modelFactory === 'function') {
      const model = modelFactory(sequelize, DataTypes);
      if (model && model.name) {
        db[model.name] = model;
      }
    }
  });

// Appelle les associations si présentes
Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

/**
 * Alias de compatibilité :
 * - Nos routes utilisent "Tenant"
 * - Ton modèle peut s’appeler "Enterprise"
 * On mappe Tenant -> Enterprise si Tenant n’existe pas explicitement.
 */
if (!db.Tenant && db.Enterprise) {
  db.Tenant = db.Enterprise;
}

// Exports standards
db.sequelize = sequelize;
db.Sequelize = Sequelize;

/**
 * Utilitaire pratique pour synchroniser localement si besoin.
 * ⚠️ Ne pas utiliser en prod à la place des migrations.
 */
db.syncAll = async (opts = {}) => {
  await sequelize.sync(opts);
};

module.exports = db;

