"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface) {
    // On récupère un enterprise_id existant
    const [enterprises] = await queryInterface.sequelize.query(
      `SELECT id FROM enterprises LIMIT 1;`
    );

    if (!enterprises || enterprises.length === 0) {
      console.warn("⚠️ Aucun enterprise trouvé → licence non créée.");
      return;
    }

    const enterpriseId = enterprises[0].id;

    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(now.getFullYear() + 1); // licence de 1 an

    await queryInterface.bulkInsert("licenses", [
      {
        id: uuidv4(),
        enterprise_id: enterpriseId,
        type: "ANNUAL",
        start_date: now,
        end_date: endDate,
        max_users: 50,
        status: "active",
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log(`✅ Licence ANNUAL créée pour enterprise ${enterpriseId}`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("licenses", null, {});
  },
};

