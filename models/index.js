// models/index.js
"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;

if (config.use_env_variable) {
  // ✅ En production → Railway fournit DATABASE_URL
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // ✅ En développement → DB_USER / DB_PASS / DB_NAME / DB_HOST
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Charger automatiquement tous les modèles
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Exécuter les associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

