import admin from "firebase-admin";
import { removeInvalidFcmToken } from "./users.services.js";

export const initFirebase = () => {
    if (!admin.apps.length) {
        try {

            let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
            if (privateKey) {
                privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
            }

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                })
            });

            console.log("✅ Firebase Admin inicializado");
        } catch (error) {
            console.error("❌ Error al inicializar Firebase Admin:", error);
        }
    }
};

/**
 * Envía una notificación a un token específico
 */
export const sendPushNotification = async (token, notification, data = {}) => {
    const message = {
        notification: {
            title: notification.title,
            body: notification.body,
        },
        webpush: {
            notification: {
                icon: 'https://grandpick.vercel.app/icons/GP-192x192.png'
            }
        },
        data: data,
        token: token
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Notificación enviada exitosamente:", response);
        return response;
    } catch (error) {
        console.error("Error al enviar notificación:", error);
        if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-registration-token') {
            console.warn(`Token inválido detectado. Removiendo de la BD: ${token}`);
            removeInvalidFcmToken(token).catch(e => console.error("Error al remover token", e));
        }
        throw error;
    }
};

/**
 * Envía notificaciones a múltiples tokens
 */
export const sendPushToMultipleTokens = async (tokens, notification, data = {}) => {
    if (!tokens || tokens.length === 0) return;

    const message = {
        notification: {
            title: notification.title,
            body: notification.body,
        },
        webpush: {
            notification: {
                icon: 'https://grandpick.vercel.app/icons/GP-192x192.png'
            }
        },
        data: data,
        tokens: tokens
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`${response.successCount} notificaciones enviadas exitosamente.`);

        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const error = resp.error;
                    if (error && (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-registration-token')) {
                        failedTokens.push(tokens[idx]);
                    }
                }
            });

            if (failedTokens.length > 0) {
                console.warn(`Removiendo ${failedTokens.length} tokens inválidos de la BD...`);
                Promise.all(failedTokens.map(t => removeInvalidFcmToken(t)))
                    .catch(e => console.error("Error removiendo tokens inválidos", e));
            }
        }

        return response;
    } catch (error) {
        console.error("Error al enviar notificaciones masivas:", error);
        throw error;
    }
};
