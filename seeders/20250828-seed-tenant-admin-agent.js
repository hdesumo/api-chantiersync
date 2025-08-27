"use strict";

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Vérifier / créer une entreprise
    let [enterprise] = await queryInterface.sequelize.query(
      `SELECT id FROM enterprises WHERE slug = 'tenant-enterprise' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!enterprise) {
      const enterpriseId = uuidv4();
      await queryInterface.bulkInsert("enterprises", [
        {
          id: enterpriseId,
          name: "Tenant Enterprise",
          slug: "tenant-enterprise",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      enterprise = { id: enterpriseId };
      console.log("✅ Entreprise 'Tenant Enterprise' créée");
    }

    // 2️⃣ Vérifier / créer un Tenant Admin
    const [existingTenantAdmin] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'tenantadmin@chantiersync.com' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!existingTenantAdmin) {
      const tenantPassword = await bcrypt.hash("tenant123", 10);

      await queryInterface.bulkInsert("users", [
        {
          id: uuidv4(),
          enterprise_id: enterprise.id,
          full_name: "Tenant Admin",
          email: "tenantadmin@chantiersync.com",
          role: "TENANT_ADMIN",
          password_hash: tenantPassword,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      console.log("✅ Tenant Admin créé (tenantadmin@chantiersync.com / tenant123)");
    }

    // 3️⃣ Vérifier / créer un Agent
    const [existingAgent] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'agent1@chantiersync.com' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!existingAgent) {
      const agentPassword = await bcrypt.hash("agent123", 10);

      await queryInterface.bulkInsert("users", [
        {
          id: uuidv4(),
          enterprise_id: enterprise.id,
          full_name: "Agent One",
          email: "agent1@chantiersync.com",
          role: "AGENT",
          password_hash: agentPassword,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      console.log("✅ Agent créé (agent1@chantiersync.com / agent123)");
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: ["tenantadmin@chantiersync.com", "agent1@chantiersync.com"],
    });
    await queryInterface.bulkDelete("enterprises", { slug: "tenant-enterprise" });
  },
};

