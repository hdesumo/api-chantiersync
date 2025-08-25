require('dotenv').config();

module.exports = {
  production: {
    dialect: "postgres",            // 👈 important !
    url: process.env.DATABASE_URL,  // injectée par Railway
    logging: false
  }
};

