require('dotenv').config();

module.exports = {
  development: {
    dialect: 'postgres',
    url: process.env.DATABASE_URL_LOCAL || 'postgresql://postgres:password@localhost:5432/chantiersync_dev',
    logging: false
  },
  test: {
    dialect: 'postgres',
    url: process.env.DATABASE_URL_TEST || 'postgresql://postgres:password@localhost:5432/chantiersync_test',
    logging: false
  },
  production: {
    dialect: 'postgres',
    url: process.env.DATABASE_URL, // Railway injecte cette variable
    logging: false
    // ⚠️ pas de SSL ici, car l'URL interne Railway (postgres.railway.internal) ne le supporte pas
  }
};

