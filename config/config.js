require('dotenv').config();

const common = {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {}
};

if (process.env.PGSSLMODE) {
  common.dialectOptions.ssl = { require: true, rejectUnauthorized: false };
}

module.exports = {
  development: { ...common, url: process.env.DATABASE_URL },
  test:        { ...common, url: process.env.DATABASE_URL },
  production:  { ...common, url: process.env.DATABASE_URL }
};

