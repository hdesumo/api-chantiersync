// config/database.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const trim = (s) => (typeof s === 'string' ? s.trim() : s);

const raw = trim(process.env.DATABASE_URL || '');
const conn = raw || ''; // si vide, on bascule sur vars PG_*
const url = conn ? new URL(conn) : null;

const sslMode = url?.searchParams.get('sslmode');
const useSsl = sslMode === 'require' || process.env.FORCE_PG_SSL === '1';

// ➜ LOG DEBUG (non sensible) : présence des variables
console.log('ENV DEBUG → has DATABASE_URL:', !!raw,
            'PGHOST:', !!process.env.PGHOST,
            'PGUSER:', !!process.env.PGUSER,
            'PGDATABASE:', !!process.env.PGDATABASE,
            'prod:', process.env.NODE_ENV === 'production');

// Si pas de DATABASE_URL, on tente les variables PG_*
let sequelize;
if (conn) {
  console.log('DB cfg → via DATABASE_URL host:', url.hostname, 'ssl:', !!useSsl);
  sequelize = new Sequelize(conn, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {}
  });
} else {
  const host = process.env.PGHOST || '127.0.0.1';
  const port = parseInt(process.env.PGPORT || '5432', 10);
  const database = process.env.PGDATABASE || 'railway';
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || '';
  console.warn('⚠️ DATABASE_URL absente — tentative via PG_* → host:', host);
  sequelize = new Sequelize(database, user, password, {
    host, port, dialect: 'postgres', logging: false
  });
}

module.exports = sequelize;

