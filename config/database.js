// config/database.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const isProd = process.env.NODE_ENV === 'production';

function fromUrl(conn) {
  const u = new URL(conn);

  // SSL si ?sslmode=require ou si FORCE_PG_SSL=1
  const sslmode = u.searchParams.get('sslmode');
  const useSsl = sslmode === 'require' || process.env.FORCE_PG_SSL === '1';

  // Normalise/encode le mot de passe pour éviter les espaces/caratères non encodés
  const cleanPwd = decodeURIComponent(u.password || '').trim();
  u.password = encodeURIComponent(cleanPwd);

  return new Sequelize(u.toString(), {
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
  });
}

function fromPgVars() {
  const host = (process.env.PGHOST || '127.0.0.1').trim();
  const port = parseInt((process.env.PGPORT || '5432').trim(), 10);
  const database = (process.env.PGDATABASE || 'railway').trim();
  const username = (process.env.PGUSER || 'postgres').trim();
  const password = (process.env.PGPASSWORD || '').trim();

  if (isProd && (!host || !database || !username || !password)) {
    throw new Error('Variables PG_* manquantes pour la connexion Postgres.');
  }

  const useSsl = process.env.FORCE_PG_SSL === '1';

  return new Sequelize(database, username, password, {
    host,
    port,
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
  });
}

const rawUrl = (process.env.DATABASE_URL || '').trim();

if (isProd && !rawUrl && !process.env.PGHOST) {
  throw new Error('DATABASE_URL manquante en production et aucune variable PG_* définie.');
}

const sequelize = rawUrl ? fromUrl(rawUrl) : fromPgVars();

module.exports = sequelize;

