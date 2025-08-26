"use strict";

module.exports = {
  async up(queryInterface) {
    // ⚠️ Remplace par l'ID réel de ton entreprise (dans ta table enterprises)
    const enterpriseId = "ID_DE_TON_ENTREPRISE";

    await queryInterface.bulkInsert("licenses", [
      {
        id: "11111111-2222-3333-4444-555555555555", // UUID fixe pour test
        enterprise_id: enterpriseId,
        type: "ANNUAL",
        start_date: new Date(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        max_users: 50,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("licenses", null, {});
  },
};

