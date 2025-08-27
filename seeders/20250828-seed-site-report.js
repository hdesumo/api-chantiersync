"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    // 🔍 Récupérer l’entreprise "Tenant Enterprise"
    const [enterprise] = await queryInterface.sequelize.query(
      `SELECT id FROM enterprises WHERE slug = 'tenant-enterprise' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!enterprise) {
      console.log("⚠️ Aucune entreprise trouvée pour créer un site.");
      return;
    }

    // 🔍 Récupérer l'Agent
    const [agent] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'agent1@chantiersync.com' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!agent) {
      console.log("⚠️ Aucun agent trouvé pour créer un rapport.");
      return;
    }

    // 1️⃣ Vérifier / créer un site
    const [existingSite] = await queryInterface.sequelize.query(
      `SELECT id FROM sites WHERE slug = 'chantier-principal' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    let siteId;
    if (!existingSite) {
      siteId = uuidv4();
      await queryInterface.bulkInsert("sites", [
        {
          id: siteId,
          enterprise_id: enterprise.id,
          name: "Chantier Principal",
          slug: "chantier-principal",
          address: "Zone industrielle, Dakar",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      console.log("✅ Site 'Chantier Principal' créé");
    } else {
      siteId = existingSite.id;
    }

    // 2️⃣ Vérifier / créer un rapport
    const [existingReport] = await queryInterface.sequelize.query(
      `SELECT id FROM reports WHERE title = 'Rapport initial sécurité' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!existingReport) {
      const reportId = uuidv4();
      await queryInterface.bulkInsert("reports", [
        {
          id: reportId,
          site_id: siteId,
          user_id: agent.id,
          title: "Rapport initial sécurité",
          description: "Casque de sécurité manquant sur le site.",
          category: "safety",
          priority: "HIGH",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      console.log("✅ Rapport initial créé pour l’Agent");
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("reports", {
      title: "Rapport initial sécurité",
    });
    await queryInterface.bulkDelete("sites", {
      slug: "chantier-principal",
    });
  },
};

