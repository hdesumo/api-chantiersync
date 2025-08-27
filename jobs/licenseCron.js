// jobs/licenseCron.js
const cron = require("node-cron");
const { License } = require("../models");

try {
  // Exécution tous les jours à minuit
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Vérification des licences expirées...");

    try {
      const expired = await License.findAll({
        where: { status: "EXPIRED" },
      });

      if (expired.length > 0) {
        console.log(`⚠️ ${expired.length} licences expirées trouvées`);
        // Ici tu pourrais notifier ou désactiver les comptes
      } else {
        console.log("✅ Aucune licence expirée.");
      }
    } catch (err) {
      console.error("Erreur dans le job licenseCron:", err.message);
    }
  });
} catch (err) {
  console.error("⚠️ Impossible de démarrer licenseCron:", err.message);
}

