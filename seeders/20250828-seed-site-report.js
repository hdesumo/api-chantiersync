// seeders/20250828-seed-site-report.js
"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ⚠️ on suppose qu’un site et un user existent déjà
    const [site] = await queryInterface.sequelize.query(
      `SELECT id FROM sites LIMIT 1;`
    );
    const [user] = await queryInterface.sequelize.query(
      `SELECT id FROM users LIMIT 1;`
    );
    const [enterprise] = await queryInterface.sequelize.query(
      `SELECT id FROM enterprises LIMIT 1;`
    );

    if (!site.length || !user.length || !enterprise.length) {
      console.warn("⚠️ Aucun site/user/enterprise trouvé → seed ignoré");
      return;
    }

    await queryInterface.bulkInsert("reports", [
      {
        id: uuidv4(),
        enterprise_id: enterprise[0].id,
        site_id: site[0].id,
        user_id: user[0].id,
        type: "incident",                 // ✅ correspond à enum_reports_type
        title: "Rapport test",
        description: "Rapport de démonstration auto-généré",
        priority: "high",                 // ✅ enum_reports_priority (minuscule)
        location: "Dakar, Sénégal",
        client_ts: new Date(),
        status: "open",                   // ✅ enum_reports_status
        sync_status: "synced",            // ✅ enum_reports_sync_status
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("reports", null, {});
  },
};

