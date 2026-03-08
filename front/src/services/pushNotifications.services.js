import { messaging, VAPID_KEY } from "../firebase-config";
import { getToken, onMessage } from "firebase/messaging";
import axios from "axios";

import API_URL from "./api.js";

/**
 * Pide permiso al usuario y obtiene el token de FCM
 */
export const requestNotificationPermission = async (userId) => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("Permiso concedido");

            // Obtener el token del dispositivo
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });

            if (token) {
                console.log("Token obtenido:", token);
                // Enviar el token al backend
                await saveTokenInBackend(userId, token);
                return token;
            } else {
                console.warn("No se pudo obtener el token.");
            }
        } else {
            console.warn("Permiso denegado");
        }
    } catch (error) {
        console.error("Error al pedir permiso de notificaciones:", error);
    }
};

/**
 * Envía el token al backend para guardarlo en la DB
 */
const saveTokenInBackend = async (userId, token) => {
    try {
        const authToken = localStorage.getItem("auth-token");
        await axios.post(`${API_URL}/api/users/fcm-token`,
            { userId, token },
            { headers: { "auth-token": authToken } }
        );
        console.log("Token guardado exitosamente en el backend");
    } catch (error) {
        console.error("Error al guardar el token en el backend:", error);
    }
};

/**
 * Escucha mensajes mientras la app está abierta (foreground)
 */
export const onForegroundMessage = () => {
    onMessage(messaging, (payload) => {
        console.log("Mensaje recibido en primer plano:", payload);
        // Aquí puedes mostrar un Toast o una notificación personalizada dentro de la UI
        // porque la notificación del sistema NO aparece automáticamente si la pestaña está activa
        alert(`${payload.notification.title}: ${payload.notification.body}`);
    });
};
