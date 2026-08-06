importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Los parámetros de configuración se envían desde main.jsx a través de la URL
const urlParams = new URLSearchParams(location.search);

const firebaseConfig = {
  apiKey: urlParams.get('apiKey'),
  authDomain: urlParams.get('authDomain'),
  projectId: urlParams.get('projectId'),
  storageBucket: urlParams.get('storageBucket'),
  messagingSenderId: urlParams.get('messagingSenderId'),
  appId: urlParams.get('appId')
};

// Inicializamos Firebase en el Service Worker
firebase.initializeApp(firebaseConfig);

// Obtenemos la instancia de Messaging para manejar los mensajes en segundo plano
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano: ', payload);
  // Firebase SDK muestra automáticamente una notificación si el payload contiene un objeto "notification".
  // Ya no necesitamos llamar a self.registration.showNotification() manualmente aquí para evitar duplicados.
});
