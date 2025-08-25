// config/config.js
require('dotenv').config();

const common = {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {}
};

// Active SSL si demandé (utile avec tramway.proxy.rlwy.net)
if (process.env.FORCE_PG_SSL === '1') {
  common.dialectOptions.ssl = { require: true, rejectUnauthorized: false };
}

module.exports = {
  development: {
    ...common,
    // En local on utilise l'hôte public
    url: process.env.DATABASE_URL_PUBLIC || process.env.DATABASE_URL
  },
  test: {
    ...common,
    url: process.env.DATABASE_URL_PUBLIC || process.env.DATABASE_URL
  },
  production: {
    ...common,
    // En prod (sur Railway), tu peux mettre l’URL interne de Railway dans les variables d'env
    url: process.env.DATABASE_URL || process.env.DATABASE_URL_PUBLIC
  }
};

