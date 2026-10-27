// Espejo de front/package.json con una línea de qué se usa para qué. Si se
// agrega/saca una dependencia, actualizar acá (y rules/diseno.md si cambia
// una regla transversal, como la librería de animaciones).
export const LIBRARIES = [
  { name: "react / react-dom", version: "18.3", use: "Base de la UI." },
  { name: "react-router-dom", version: "6.28", use: "Ruteo de páginas." },
  { name: "framer-motion", version: "12", use: "Toda animación de UI (regla del proyecto), salvo loops infinitos decorativos (CSS nativo)." },
  { name: "chart.js / react-chartjs-2", version: "4.5 / 5.3", use: "Gráficos (anillos de Profile.jsx, etc.)." },
  { name: "react-select", version: "5.10", use: "Selects buscables (país, circuito)." },
  { name: "react-window", version: "2.2", use: "Virtualización de listas largas." },
  { name: "luxon", version: "3.7", use: "Fechas y zonas horarias (calendario, countdowns)." },
  { name: "date-fns-tz", version: "3.2", use: "Utilidades de fecha/zona horaria puntuales." },
  { name: "axios", version: "1.13", use: "Cliente HTTP (fuera de apiFetch con fetch nativo, para algunos casos puntuales)." },
  { name: "socket.io-client", version: "4.8", use: "Tiempo real (notificaciones, actualizaciones en vivo)." },
  { name: "firebase", version: "12.10", use: "Push notifications (FCM)." },
  { name: "country-flag-emoji-polyfill", version: "0.1", use: "Banderas emoji consistentes entre navegadores/SO." },
  { name: "Bootstrap 5", version: "5.3 (CDN)", use: "Grilla y utilidades. No se usan sus componentes JS más que el navbar." },
  { name: "Bootstrap Icons", version: "1.11 (CDN)", use: "Iconografía (`bi bi-…`), ver sección Iconografía." },
];
