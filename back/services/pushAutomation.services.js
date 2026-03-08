import { connectDB } from "./db.services.js";
import { sendPushToMultipleTokens } from "./fcm.services.js";
import * as racesService from "./races.services.js";

/**
 * Busca todos los usuarios con tokens de FCM y envía una notificación
 */
export const notifyAllUsers = async (notification, data = {}) => {
    const db = await connectDB();
    const users = await db.collection("Users").find({
        fcmTokens: { $exists: true, $not: { $size: 0 } }
    }).toArray();

    const allTokens = users.flatMap(u => u.fcmTokens);

    if (allTokens.length > 0) {
        // Firebase Admin sendMulticast soporta hasta 500 tokens por llamada
        // Para simplificar enviamos a todos, pero en prod real habría que paginar de a 500
        return sendPushToMultipleTokens(allTokens, notification, data);
    }
};

/**
 * Lógica para notificaciones automáticas basadas en el estado de las carreras
 */
export const checkAndTriggerPushNotifications = async () => {
    try {
        const db = await connectDB();
        const now = new Date();

        // 1. Notificación 30 min antes de que cierre el envío de predicciones
        // En este proyecto, las predicciones cierran cuando empieza la carrera (date_race)
        const thirtyMinFromNow = new Date(now.getTime() + 30 * 60 * 1000);

        const closingSoon = await db.collection("Races").find({
            date_race: { $gt: now, $lte: thirtyMinFromNow },
            predictions_closing_notified: { $ne: true }
        }).toArray();

        for (const race of closingSoon) {
            await notifyAllUsers({
                title: "¡Últimos 30 minutos!",
                body: `Faltan 30 minutos para que cierren las predicciones de ${race.type} en ${race.circuit_name || 'el circuito'}.`
            }, { link: `/predictions/${race._id}` });

            await db.collection("Races").updateOne({ _id: race._id }, { $set: { predictions_closing_notified: true } });
        }

        // 2. Notificación cuando empieza la sesión
        const sessionsStarting = await db.collection("Races").find({
            date_race: { $lte: now },
            state: "Pendiente",
            session_started_notified: { $ne: true }
        }).toArray();

        for (const race of sessionsStarting) {
            await notifyAllUsers({
                title: `¡Empieza la ${race.type}!`,
                body: `La sesión de ${race.type} acaba de comenzar. ¡Mucha suerte!`
            });

            await db.collection("Races").updateOne({ _id: race._id }, { $set: { session_started_notified: true } });
        }

        // 3. Notificación cuando se publican resultados
        const resultsPublished = await db.collection("Races").find({
            state: "Finalizado",
            results: { $exists: true, $not: { $size: 0 } },
            results_notified: { $ne: true }
        }).toArray();

        for (const race of resultsPublished) {
            await notifyAllUsers({
                title: "Resultados publicados",
                body: `Ya están disponibles los resultados de ${race.type}. ¡Revisa tus puntos!`
            }, { link: `/results/${race._id}` });

            await db.collection("Races").updateOne({ _id: race._id }, { $set: { results_notified: true } });
        }

    } catch (error) {
        console.error("Error en checkAndTriggerPushNotifications:", error);
    }
};
