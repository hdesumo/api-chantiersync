const cron = require("node-cron");
const { License } = require("../models");

// ⏰ Vérification chaque jour à minuit
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Vérification des licences...");

  try {
    const now = new Date();

    // Trouver toutes les licences expirées
    const expired = await License.findAll({
      where: {
        end_date: { [require("sequelize").Op.lt]: now },
        status: "active",
      },
    });

    for (const lic of expired) {
      lic.status = "expired";
      await lic.save();
      console.log(`⚠️ Licence ${lic.id} expirée`);
    }

    console.log("✅ Vérification terminée");
  } catch (err) {
    console.error("Erreur cron licences:", err);
  }
});

