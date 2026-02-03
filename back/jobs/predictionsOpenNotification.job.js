import cron from "node-cron";
import * as racesService from "../services/races.services.js";
import { sendGlobalNotification } 
  from "../services/realtimeNotifications.services.js";

// 🔹 se ejecuta UNA SOLA VEZ al levantar el server
console.log("🟢 Predictions cron loaded");

// ⏱️ se ejecuta cada 5 segundos
cron.schedule("*/2 * * * *", async () => {
  try {
    console.log("⏱️ Checking prediction windows...");

    const now = new Date();
    const race = await racesService.findNextRace();

    if (!race) return;
    if (race.predictions_notification_sent) return;

    const openAt = race.predictions_open_at;

    if (now >= openAt) {
      await sendGlobalNotification(global.app, {
        title: "Predicciones habilitadas",
        message: "Ya podés hacer tus predicciones para la próxima carrera",
        link: `/predictions/${race._id}`,
        type: "success"
      });

      // ⚠️ en producción DESCOMENTAR
      // await racesService.markPredictionsNotified(race._id);
    }
  } catch (err) {
    console.error("❌ Cron predictions error:", err);
  }
});
