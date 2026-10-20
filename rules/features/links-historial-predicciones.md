# Links propios por GP y sesión en el historial

## Formato
- `/prediction-history?gp=<circuitId>&session=<race|sprint|qualifying>&year=<YYYY>` → historial propio.
- `/prediction-history/<userId>?gp=...&session=...` → historial de otro usuario (links compartidos).
- Sin `session` = GP completo (se elige la sesión por defecto). `year` opcional (default año actual). `qualy` se acepta como alias de `qualifying`.

## Front
- `PredictionHistory.jsx` lee `gp`/`session`/`year` con `useSearchParams` al cargar y los actualiza (`replace`) al cambiar de GP o de tab, así la URL siempre es compartible.
- Botones "Compartir sesión" / "Compartir GP": arman el link con el `userId` del historial visible (propio o ajeno) y copian directo al portapapeles (`showAlert`), igual que el botón del ranking.
- `ProtectedRoute` guarda `state.from` (path + query) al redirigir a `/login`; `Login` → `onLogin(user, token, redirectTo)` vuelve a esa URL.
- Push en primer plano (`pushNotifications.services.js`) respeta `data.link` si empieza con `/prediction-history`.

## Back
- `races.api.controllers.js` (edición de carrera con resultados): la notificación global usa `link = /prediction-history?gp=<id_circuit>&session=<points_system.type>` de la sesión cargada. Sin `userId`: cada destinatario abre su propio historial.

## Visibilidad
El endpoint ya oculta `prediction` de otros usuarios hasta que la sesión está cerrada.

## Mobile
En pantallas < 1200px el detalle vive en el drawer: al cargar con un `gp` válido en la URL el drawer se abre automáticamente (sin `gp` se muestra la lista).

## Botones de compartir
- Solo se muestran en el historial propio (`isOwnHistory`); en el de otro usuario no aparecen.
- En el drawer mobile (fondo claro) usan la clase `history-share-drawer` (fondo `#0d1b2a`, texto blanco) porque el `btn-outline-light` blanco no se veía. En desktop mantienen `btn-outline-light`.

## Scroll de la lista
Al cargar con un `gp` válido en la URL, la lista lateral (`.history-sidebar`) se desplaza para centrar la card del GP seleccionado (se ajusta `scrollTop` del contenedor, no el de la página; solo en la carga inicial, los clicks manuales no mueven la lista).

## Abrir mi propio link
`isOwnHistory = !routeUserId || routeUserId === user._id`: si el `userId` de la URL es el del usuario logueado, se muestra como historial propio ("Mi Historial", botones de compartir, sin resumen ni "Volver al ranking" y sin pedir stats). Para cualquier otro usuario se ve como historial ajeno, sin botones de compartir.

## Diseño de la tabla
La tabla del historial usa el mismo diseño oscuro que la comparación del ranking por GP (`PredictionComparisonTable`, clases `cmp-*`) pero conserva sus 4 columnas: `#`, `Tu predicción` (`Predicción` si es el historial de otro usuario), `Resultado real` y `Puntos` (píldora por fila). Las pestañas SPRINT/QUALY/RACE (`SessionTabs`) también son oscuras, con puntito y borde del color de la sesión; mantienen fecha y puntos. Estilos propios del historial en `predictionCompare.css` (`.cmp-table-scroll--history`, `.is-solo`, `.history-session-tab--*`, y reglas `.history-detail` bajo 1200px para el drawer mobile).
