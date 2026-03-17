import admin from "firebase-admin";

// TODO: Descargar el JSON de la cuenta de servicio desde Firebase Console
// Configuración -> Cuentas de servicio -> Generar nueva clave privada
// import serviceAccount from "../config/firebase-service-account.json" assert { type: "json" };

/**
 * Inicializa Firebase Admin
 * Se recomienda usar variables de entorno o un archivo JSON para la cuenta de servicio
 */
export const initFirebase = () => {
    if (!admin.apps.length) {
        try {
            // Opción A: Usando archivo JSON (más común para local/VPS)
            /*
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount)
            });
            */

            // Manejar las variables de entorno de forma segura, removiendo comillas si hosting como Railway las añadió
            let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
            if (privateKey) {
                // Remover comillas del inicio y final (si existen) y formatear los enter literales a saltos de linea reales
                privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
            }

            // Opción B: Usando variables de entorno (más seguro para Heroku/Vercel)
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
        data: data, // Datos extra (ej: { link: '/races/123' })
        token: token
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Notificación enviada exitosamente:", response);
        return response;
    } catch (error) {
        console.error("Error al enviar notificación:", error);
        // Si el error es 'registration-token-not-registered', deberíamos borrar el token de la DB
        if (error.code === 'messaging/registration-token-not-registered') {
            console.warn("Token ya no es válido. Debería ser removido.");
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
        tokens: tokens // Firebase soporta enviar a múltiples tokens
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`${response.successCount} notificaciones enviadas exitosamente.`);
        return response;
    } catch (error) {
        console.error("Error al enviar notificaciones masivas:", error);
        throw error;
    }
};
