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
