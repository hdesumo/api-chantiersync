// config/database.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const conn = process.env.DATABASE_URL;

if (!conn && process.env.NODE_ENV === 'production') {
  // En prod, on refuse de tomber sur localhost par accident
  throw new Error('DATABASE_URL manquante en production');
}

const url = conn ? new URL(conn) : null;
const sslMode = url?.searchParams.get('sslmode');
const useSsl = sslMode === 'require' || process.env.FORCE_PG_SSL === '1';

// Log non-sensible pour vérifier la prise en compte (host/ssl)
console.log('DB cfg → host:', url?.hostname || process.env.PGHOST || '127.0.0.1',
            'ssl:', !!useSsl, 'prod:', process.env.NODE_ENV === 'production');

const sequelize = conn
  ? new Sequelize(conn, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {}
    })
  : new Sequelize(
      process.env.PGDATABASE || 'chantiersync',
      process.env.PGUSER || 'postgres',
      process.env.PGPASSWORD || 'postgres',
      {
        host: process.env.PGHOST || '127.0.0.1', // évite ::1
        port: parseInt(process.env.PGPORT || '5432', 10),
        dialect: 'postgres',
        logging: false
      }
    );

module.exports = sequelize;

