# Modelo de datos y lógica de negocio

Base MongoDB `GrandPick`. Referencias entre colecciones por `ObjectId`.

## Colecciones

### `Drivers`
```
_id, full_name, number (string), country (ISO2), trigram (3 letras),
img (Cloudinary), active (bool), team (ObjectId -> Teams | null)
```

### `Teams`
```
_id, name (corto), full_team_name, chief, power_unit, world_championships,
country, city, color (HEX), logo, isologo, drivers: [ObjectId -> Drivers]
```

### `Circuits`
```
_id, circuit_name, gp_name, length, laps, description, country, city,
timezone, img
```

### `Points_System`
Sistemas de puntaje. `points` es el array de puntos por posición (índice 0 = P1).
```
{ type: "race",       points: [25,18,15,12,10,8,6,4,2,1] }
{ type: "sprint",     points: [8,7,6,5,4,3,2,1] }
{ type: "qualifying", points: [9,6,3] }
```

### `Races`
Un **fin de semana de GP** se guarda como **varios documentos** `Races`, uno por
cada sesión habilitada (una por `points_system`). No hay un campo `type` fiable a
nivel documento: **la sesión se identifica por `points_system`**.
```
_id, id_circuit (ObjectId -> Circuits), points_system (ObjectId -> Points_System),
date_gp_start, date_gp_end, date_race (Date),
state ("Pendiente" | "Finalizado"),
results: [ { position: Number, driver: ObjectId -> Drivers } ]
```
`results` vacío = sesión sin cargar todavía.

### Otras
- `Users`, `Tokens` — cuentas y auth (JWT en header `auth-token`).
- `Predictions` — pronósticos de usuarios por carrera.
- `Users_Points` / `Users.points` — puntaje del **juego de predicciones** (no
  confundir con los puntos de los pilotos).
- `notifications`, `user_notifications` — sistema de notificaciones/push.

## Reglas de negocio

### Puntos de los PILOTOS (campeonato real) — Clasificación
- Suman al campeonato de pilotos **solo las sesiones `race` y `sprint`**.
- `qualifying` **no otorga** puntos al campeonato (igual que en la F1 real).
- Puntos de un piloto en una sesión = `points_system.points[position - 1]`.
- Total de temporada = suma sobre todas las carreras del año con `results`
  cargados.
- Implementado en `back/services/drivers.services.js` →
  `findDriversStandings(year)`. Ver [features/clasificacion-pilotos.md](./features/clasificacion-pilotos.md).

### Puntos del JUEGO de predicciones (usuarios)
- `back/services/points.services.js` → `updatePointsAfterRace(raceId)`.
- Compara `Predictions.prediction[i].driver` contra `race.results[i].driver` y
  acumula `points_system.points[i]` por acierto de posición.
- Regla histórica: para sesiones de qualy anteriores al 2026-05-21 los puntos se
  dividían por 3.
- Desempate del ranking global (estilo F1 / countback): puntos totales →
  aciertos → promedio por predicción → mejores fines de semana.

### Estados de carrera / ventana de predicción
`utils/helpers.js` → `computeRaceState()`: la ventana de predicción abre 24 h
antes de `date_race`; antes de eso es "pre-window"; pasada la hora de inicio o con
`state === "Finalizado"` queda cerrada.

### Visibilidad de predicciones ajenas (control server-side)
Criterio de "sesión cerrada" (único, usado también en el frontend por
`getSessionButtonStatus` de `components/predictions/SessionTabs.jsx`):
```js
const isSessionClosed = race.state === "Finalizado" || (race.results && race.results.length > 0);
```
Se puede ver la predicción de **otro** usuario para una sesión solo si esa
sesión está cerrada, o si quien consulta es el dueño de la predicción o un
admin (`isOwnerOrAdmin = viewer.isAdmin || String(viewer.id) === String(userId)`).
Antes este control era solo visual en el front; ahora se aplica también en
`back/services/predictions.services.js`, recibiendo un `viewer = { id, isAdmin }`
armado por los controllers a partir de `req.usuario` (middleware `autenticado`):

- `getUserPredictionHistory(userId, year, viewer)` — cada sesión del historial
  redacta `prediction` a `null` si no es dueño/admin y la sesión no está cerrada.
- `findPredictionByUserAndRace(userId, raceId, viewer)` — devuelve `null` en vez
  de la predicción real si no es dueño/admin y la carrera no está cerrada.
- `findPredictionsByUserId(userId, viewer)` — si no es dueño/admin, filtra el
  array dejando solo las predicciones cuya carrera esté cerrada (las abiertas
  se excluyen directamente, no se redactan campos).

Rutas afectadas (todas ya tenían `autenticado`): `GET /api/users/:UserId/predictions`,
`GET /api/users/:UserId/predictions/:RaceId`, `GET /api/users/:UserId/predictions-history`.
