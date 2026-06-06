import { connectDB } from "./db.services.js";
import { sendPushToMultipleTokens } from "./fcm.services.js";
import * as racesService from "./races.services.js";

/**
 * Busca todos los usuarios, crea una notificación interna para la app
 * y envía Push a aquellos que tengan tokens FCM.
 */
export const notifyAllUsers = async (notification, data = {}) => {
    const db = await connectDB();
    const users = await db.collection("Users").find({}).toArray();

    // 1. Crear notificación en la base de datos (In-App)
    const { createGlobalNotification, assignNotificationToUsers } = await import("./notifications.services.js");
    const notificationId = await createGlobalNotification({
        title: notification.title,
        message: notification.body,
        link: data.link || "",
        type: "info"
    });

    if (users.length > 0) {
        await assignNotificationToUsers(notificationId, users);
    }

    // 2. Enviar notificaciones Push
    const usersWithTokens = users.filter(u => u.fcmTokens && u.fcmTokens.length > 0);
    const allTokens = usersWithTokens.flatMap(u => u.fcmTokens);

    if (allTokens.length > 0) {
        // Firebase Admin sendMulticast soporta hasta 500 tokens por llamada
        return sendPushToMultipleTokens(allTokens, notification, data);
    }
};

/**
 * Verifica si existen sesiones previas del mismo GP que no han finalizado.
 * Retorna true si hay alguna sesión pendiente que impide enviar notificaciones de la actual.
 */
const hasUnfinishedEarlierSessions = async (db, raceIdCircuit, raceDate) => {
    const unfinished = await db.collection("Races").find({
        id_circuit: raceIdCircuit,
        date_race: { $lt: raceDate },
        state: { $ne: "Finalizado" }
    }).toArray();
    
    return unfinished.length > 0;
};

/**
 * Lógica para notificaciones automáticas basadas en el estado de las carreras
 */
export const checkAndTriggerPushNotifications = async () => {
    try {
        const db = await connectDB();
        const now = new Date();

        // 1. Notificación 30 min antes de que cierre el envío de predicciones
        const thirtyMinFromNow = new Date(now.getTime() + 30 * 60 * 1000);

        const closingSoon = await db.collection("Races").aggregate([
            {
                $match: {
                    date_race: { $gt: now, $lte: thirtyMinFromNow },
                    predictions_closing_notified: { $ne: true }
                }
            },
            {
                $lookup: {
                    from: "Circuits",
                    localField: "id_circuit",
                    foreignField: "_id",
                    as: "circuit"
                }
            },
            {
                $lookup: {
                    from: "Points_System",
                    localField: "points_system",
                    foreignField: "_id",
                    as: "points_system"
                }
            },
            { $unwind: { path: "$circuit", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$points_system", preserveNullAndEmptyArrays: true } }
        ]).toArray();

        for (const race of closingSoon) {
            if (await hasUnfinishedEarlierSessions(db, race.id_circuit, race.date_race)) {
                console.log(`[pushAutomation] Retrasando notificación (30 min) para circuito ${race.id_circuit} porque hay sesiones anteriores no finalizadas.`);
                continue;
            }

            const typeName = race.points_system?.type || 'la sesión';
            const circuitName = race.circuit?.circuit_name || 'el circuito';
            await notifyAllUsers({
                title: "¡Últimos 30 minutos!",
                body: `Faltan 30 minutos para que cierren las predicciones de ${typeName} en ${circuitName}.`
            }, { link: `/predictions` }); // Redirige a predicciones

            await db.collection("Races").updateOne({ _id: race._id }, { $set: { predictions_closing_notified: true } });
        }

        // 2. Notificación cuando empieza la sesión
        const sessionsStarting = await db.collection("Races").aggregate([
            {
                $match: {
                    date_race: { $lte: now },
                    state: { $ne: "Finalizado" }, // Solo si no está finalizado (en curso)
                    session_started_notified: { $ne: true }
                }
            },
            {
                $lookup: {
                    from: "Points_System",
                    localField: "points_system",
                    foreignField: "_id",
                    as: "points_system"
                }
            },
            { $unwind: { path: "$points_system", preserveNullAndEmptyArrays: true } }
        ]).toArray();

        for (const race of sessionsStarting) {
            if (await hasUnfinishedEarlierSessions(db, race.id_circuit, race.date_race)) {
                console.log(`[pushAutomation] Retrasando notificación (Inicio) para circuito ${race.id_circuit} porque hay sesiones anteriores no finalizadas.`);
                continue;
            }

            const typeName = race.points_system?.type || 'la carrera';
            await notifyAllUsers({
                title: `¡Empieza ${typeName}!`,
                body: `El contador llegó a cero y la sesión de ${typeName} acaba de comenzar. ¡Mucha suerte a todos!`
            }, { link: `/predictions` });

            await db.collection("Races").updateOne({ _id: race._id }, { $set: { session_started_notified: true } });
        }

        // 3. Notificación cuando se abren predicciones para la próxima sesión
        // Calculamos la proxima sesion. Si abrió (now >= date_race de la sesion ANTERIOR), y es "Pendiente" y no notificada
        // Pero es más fácil chequear si current_or_next race ya está en periodo de 24h previas a su inicio
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const sessionsOpening = await db.collection("Races").aggregate([
            {
                $match: {
                    date_race: { $gt: now, $lte: twentyFourHoursFromNow },
                    predictions_opening_notified: { $ne: true },
                    state: "Pendiente"
                }
            },
            {
                $lookup: {
                    from: "Points_System",
                    localField: "points_system",
                    foreignField: "_id",
                    as: "points_system"
                }
            },
            {
                $lookup: {
                    from: "Circuits",
                    localField: "id_circuit",
                    foreignField: "_id",
                    as: "circuit"
                }
            },
            { $unwind: { path: "$points_system", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$circuit", preserveNullAndEmptyArrays: true } }
        ]).toArray();

        for (const race of sessionsOpening) {
             if (await hasUnfinishedEarlierSessions(db, race.id_circuit, race.date_race)) {
                 console.log(`[pushAutomation] Retrasando notificación (Apertura) para circuito ${race.id_circuit} porque hay sesiones anteriores no finalizadas.`);
                 continue;
             }

             const typeName = race.points_system?.type || 'la carrera';
             const gpName = race.circuit?.gp_name || '';
             
             await notifyAllUsers({
                title: `Predicciones habilitadas ${gpName}`,
                body: `Ya podés hacer tus predicciones para la sesión de ${typeName}.`
            }, { link: `/predictions` });

            await db.collection("Races").updateOne({ _id: race._id }, { $set: { predictions_opening_notified: true } });
        }

    } catch (error) {
        console.error("Error en checkAndTriggerPushNotifications:", error);
    }
};
