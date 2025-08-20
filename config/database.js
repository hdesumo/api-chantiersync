// config/database.js
const { Sequelize } = require('sequelize');

/**
 * Priorité :
 * 1) DATABASE_URL (format URI Postgres, ex. Railway public/private)
 * 2) Variables DB_* (fallback dev local)
 *
 * SSL :
 * - Activé automatiquement si l'URL contient `sslmode=require` ou `sslmode=no-verify`
 * - Ou si FORCE_PG_SSL=1
 * - Utilise rejectUnauthorized:false pour éviter l'erreur "self-signed certificate"
 */
const {
  DATABASE_URL,
  DB_USER = 'cs',
  DB_PASS = 'cs',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'chantiersync',
  FORCE_PG_SSL,
} = process.env;

// URL finale (fallback si DATABASE_URL absent)
const url =
  (DATABASE_URL && DATABASE_URL.trim()) ||
  `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASS)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Détection TLS (require / no-verify) ou forçage via env
const needSSL =
  /sslmode=(require|no-verify)/i.test(url) || FORCE_PG_SSL === '1';

const sequelize = new Sequelize(url, {
  dialect: 'postgres',
  logging: false, // mets true en cas de debug SQL
  dialectOptions: needSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false, // évite "self-signed certificate in certificate chain"
        },
      }
    : {},
  pool: {
    max: 10,
    min: 0,
    acquire: 30_000,
    idle: 10_000,
  },
});

module.exports = sequelize;

