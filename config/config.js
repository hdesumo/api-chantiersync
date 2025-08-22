// config/config.js
require('dotenv').config();

module.exports = {
  development: {
    // utile si tu veux tester en local plus tard
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || "postgres",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: process.env.DB_SSL === "true" ? { require: true, rejectUnauthorized: false } : false
    },
    logging: false
  },

  // >>> utilisé sur Railway (Shell + container)
  production: {
    use_env_variable: "DATABASE_URL", // Railway la fournit automatiquement
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    },
    logging: false
  }
};

