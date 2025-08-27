"use strict";

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Vérifie si une entreprise existe déjà
    let [enterprise] = await queryInterface.sequelize.query(
      `SELECT id FROM enterprises LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!enterprise) {
      const newId = uuidv4();
      await queryInterface.bulkInsert("enterprises", [
        {
          id: newId,
          name: "Demo Enterprise",
          slug: "demo-enterprise",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      enterprise = { id: newId };
    }

    // Vérifie si le superadmin existe déjà
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'superadmin@chantiersync.com' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existing) {
      console.log("⚠️ Superadmin déjà existant, seed ignoré.");
      return;
    }

    // Hash bcrypt du mot de passe "superadmin123"
    const hash = await bcrypt.hash("superadmin123", 10);

    await queryInterface.bulkInsert("users", [
      {
        id: uuidv4(),
        email: "superadmin@chantiersync.com",
        full_name: "Super Admin",
        role: "SUPERADMIN", // ✅ cohérent avec l’ENUM
        password_hash: hash,
        enterprise_id: enterprise.id,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log("✅ Superadmin superadmin@chantiersync.com / superadmin123 créé avec succès");
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", { email: "superadmin@chantiersync.com" });
  },
};

