require('dotenv').config();

const common = {
  dialect: 'postgres',
  logging: false
};

module.exports = {
  development: process.env.DATABASE_URL ? {
    use_env_variable: 'DATABASE_URL',
    ...common
  } : {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'chantiersync',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    ...common
  },
  test: {
    username: 'postgres',
    password: 'postgres',
    database: 'chantiersync_test',
    host: '127.0.0.1',
    port: 5432,
    ...common
  },
  production: process.env.DATABASE_URL ? {
    use_env_variable: 'DATABASE_URL',
    ...common
  } : {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    ...common
  }
};

