// models/index.js
"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

const configFile = require(path.join(__dirname, "..", "config", "config.js"));
const config = configFile[env];

if (!config) {
  throw new Error(`❌ Config not found for env: ${env} in config/config.js`);
}

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const db = {};

// Charger et vérifier tous les modèles
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    console.log("🔍 Loading model:", file); // log debug
    const required = require(path.join(__dirname, file));

    if (typeof required !== "function") {
      throw new Error(`❌ Model ${file} does not export a function`);
    }

    const model = required(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
    console.log(`✅ Loaded model: ${model.name}`);
  });

// Exécuter les associations si présentes
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
    console.log(`🔗 Associated model: ${modelName}`);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

