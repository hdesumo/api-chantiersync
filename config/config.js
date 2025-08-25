{
  "name": "api-chantiersync",
  "version": "1.0.0",
  "main": "app.js",
    "scripts": {
      "start": "node app.js",
      "dev": "nodemon app.js",
      "migrate": "NODE_ENV=production npx sequelize-cli db:migrate",
      "migrate:undo": "NODE_ENV=production npx sequelize-cli db:migrate:undo",
      "migrate:undo:all": "NODE_ENV=production npx sequelize-cli db:migrate:undo:all",
      "seed": "NODE_ENV=production npx sequelize-cli db:seed:all",
      "seed:undo": "NODE_ENV=production npx sequelize-cli db:seed:undo:all"
  },
  "dependencies": {
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^8.0.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "pg": "^8.12.0",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.37.7",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.10",
    "sequelize-cli": "^6.6.3"
  }
}

