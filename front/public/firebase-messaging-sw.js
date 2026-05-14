/* eslint-disable no-undef */
// importScripts logic for FCM in background
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Leer variables desde la URL de registro del Service Worker
const urlParams = new URLSearchParams(location.search);
const firebaseConfig = {
    apiKey: urlParams.get("apiKey"),
    authDomain: urlParams.get("authDomain"),
    projectId: urlParams.get("projectId"),
    storageBucket: urlParams.get("storageBucket"),
    messagingSenderId: urlParams.get("messagingSenderId"),
    appId: urlParams.get("appId")
};

// Si por alguna razón los params vinieron vacíos, Firebase explotará abajo, 
// pero está bien porque esto es inyectado desde React.
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano ', payload);

    // Si Firebase detecta un objeto "notification" en el payload, él MISMO dibuja 
    // la notificación automáticamente. Solo dibujamos la manual si Firebase no lo hizo 
    // (por ejemplo si solo mandamos "data" desde el backend).
    if (!payload.notification) {
        const notificationTitle = payload.data?.title || 'GRANDPICK';
        const notificationOptions = {
            body: payload.data?.body || 'Nueva notificación',
            icon: '/icons/GP-192x192.png',
            data: payload.data
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
    }
});

// Para que la PWA sea instalable, Chrome exige que el Service Worker tenga un evento fetch.
self.addEventListener('fetch', function (event) {
    // Evento vacío o lógica de caché offline básica si quisieras agregarla en el futuro.
});
