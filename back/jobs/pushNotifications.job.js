import cron from "node-cron";
import { checkAndTriggerPushNotifications } from "../services/pushAutomation.services.js";

// Se ejecuta cada 1 minuto para chequear eventos próximos
cron.schedule("* * * * *", async () => {
    console.log("⏱️ Checking for scheduled push notifications...");
    await checkAndTriggerPushNotifications();
});

console.log("🔔 Push Notifications automation job loaded");
