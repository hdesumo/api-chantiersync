require('dotenv').config();

module.exports = {
  production: {
    dialect: "postgres",
    url: process.env.DATABASE_URL, // fourni par Railway
    logging: false
    // ⚠️ pas de SSL ici car postgres.railway.internal ne le supporte pas
  }
};

