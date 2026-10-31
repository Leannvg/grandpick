# Modelo de datos y lógica de negocio

Base MongoDB `GrandPick`. Referencias entre colecciones por `ObjectId`.

## Colecciones

### `Drivers`
```
_id, full_name, number (string, opcional), country (ISO2), trigram (3 letras),
img (Cloudinary), active (bool), team (ObjectId -> Teams | null),
role ("titular" | "suplente" | ausente)
```
`team` y `role` se gestionan **únicamente** desde `Assignments.jsx` (pantalla
"Asignaciones" del admin) — el alta/edición de piloto (`DriverForm.jsx`) es
solo datos propios del piloto, no toca ninguno de los dos. Regla de negocio:
un equipo puede tener cualquier cantidad de pilotos, pero **nunca más de 2
con `role: "titular"` a la vez** — se valida tanto en el cliente
(`Assignments.jsx`) como en el servidor
(`PATCH /api/dashboard/drivers/assignments` →
`updateDriverAssignments`, `back/services/drivers.services.js`), que revisa
el estado resultante completo antes de guardar nada. Un piloto sin `role`
(ninguno todavía, ver migración abajo) o con `"suplente"` cuenta igual para
ese límite (ninguno de los dos es titular). `active` es un campo aparte
(habilitado/deshabilitado, sin UI en el admin desde este cambio — ver
`rules/registro-de-cambios.md`) y no debe confundirse con `role`: un piloto
deshabilitado no aparece en el roster público ni en ningún selector,
independientemente de su `role`.

**Quién se puede predecir vs. quién puede aparecer en un resultado** (son
reglas distintas, no confundir):
- **Predecir** (`pages/Predictions.jsx`, el selector público de pilotos):
  solo titulares activos (`active === true && role === "titular"`). Un
  suplente no es seleccionable para predecir, aunque esté activo — la idea
  es que antes de cada GP, si hay un reemplazo real, el admin actualiza los
  roles en Asignaciones (marca titular al que corre esa carrera) y así el
  selector de predicción queda alineado solo. Si una predicción vieja quedó
  con un piloto que después pasó a suplente, el selector igual la muestra
  (no la rompe), solo no deja elegirlo de nuevo.
- **Cargar resultado real** (`components/PredictionsForm.jsx`, usado por
  `RaceForm.jsx` en el admin): cualquier piloto activo, titular o suplente
  — ahí se registra quién corrió de verdad, no una predicción, así que un
  suplente que efectivamente corrió tiene que poder cargarse como resultado.

**Migración**: no hay script — los pilotos cargados antes de este campo
simplemente no tienen `role`. Se tratan como suplentes en todos lados hasta
que un admin les asigne `role` explícitamente desde Asignaciones.

### `Teams`
```
_id, name (corto), full_team_name, chief, power_unit, world_championships,
country, city, color (HEX), logo, isologo
```
El array `drivers` que devuelven `findAllTeams`/`findTeamById` **no es un
campo guardado en el documento** — se arma al vuelo con un `$lookup` inverso
(`Drivers` donde `team == Teams._id`). Existe una función vieja,
`findTeamWithDrivers` (`back/services/teams.services.js`), que sí asume un
array `drivers` guardado en Team — es código muerto, ninguna ruta la llama;
no replicar ese patrón.

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
results: [ { position: Number, driver: ObjectId -> Drivers, team: ObjectId -> Teams | null } ]
```
`results` vacío = sesión sin cargar todavía. `results[].team` guarda la
escudería con la que ese piloto corrió **esa carrera puntual** (no el equipo
actual del piloto): un piloto puede cambiar de escudería durante la
temporada, y `Drivers.team` es un único campo mutable sin historial (se
sobreescribe sin dejar rastro desde `Assignments.jsx`/`DriverForm.jsx`). Por
eso el campeonato de constructores no puede calcularse a partir del equipo
actual del piloto — necesita este campo por resultado. Se carga en el mismo
formulario de resultados (`RaceForm.jsx` → `PredictionsForm.jsx`), sugerido
en base al equipo actual del piloto pero editable. Carreras cargadas antes de
este campo tienen `team: null` (o el campo ausente) y no se cuentan en
constructores hasta que se complete manualmente.

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
- El equipo que se muestra ahí es el **equipo actual** del piloto
  (`Drivers.team`), no el que tenía en cada carrera puntual — por eso la
  columna se llama "Equipo Actual". Es una simplificación aceptada para
  pilotos, pero no sirve para sumar constructores (ver abajo).

### Puntos de los CONSTRUCTORES (campeonato real) — Clasificación
- Misma regla de puntaje que pilotos (Carrera + Sprint, `qualifying` no
  otorga), pero sumando por `results[].team` en vez del equipo actual del
  piloto — así un cambio de escudería a mitad de año no le atribuye
  retroactivamente todos los puntos viejos al equipo nuevo.
- Implementado en `back/services/teams.services.js` →
  `findConstructorsStandings(year)`. Devuelve `{ standings, unresolvedResults }`;
  `unresolvedResults` cuenta resultados puntuables cuyo `team` todavía no está
  cargado (carreras viejas, previas a este campo) — esos puntos no se suman
  hasta completarlos.

### Puntos del JUEGO de predicciones (usuarios)
- `back/services/points.services.js` → `updatePointsAfterRace(raceId)`.
- Compara `Predictions.prediction[i].driver` contra `race.results[i].driver` y
  acumula `points_system.points[i]` por acierto de posición.
- Regla histórica: para sesiones de qualy anteriores al 2026-05-21 los puntos se
  dividían por 3. **Bug conocido:** la condición que aplica esto usa `race.type`,
  que no existe en `Races` (la sesión se identifica por `points_system`, no por
  `type`), así que nunca se aplicó. Sin corregir — ver
  `rules/features/estadisticas-perfil.md`.
- Desempate del ranking global (estilo F1 / countback): puntos totales →
  aciertos → promedio por predicción → mejores fines de semana. Vive duplicado en
  dos lugares: `front/src/pages/Ranking.jsx` (lo calcula al mostrar la tabla) y
  `back/services/points.services.js` → `compareForRanking()` (lo recalcula una vez
  por carga de resultados y lo guarda en `Users.ranking_position`, para que la
  ficha de piloto lo lea sin recorrer a todos los usuarios en cada visita). Si se
  cambia el desempate, actualizar los dos.
- Ranking por **sesión individual** (no por GP ni por temporada):
  `updateSessionRanking(raceId)` en `points.services.js`, guarda `rank`/
  `totalPlayers` en cada `Users_Points`. Ver `rules/features/estadisticas-perfil.md`.
- Desempate del ranking **por Gran Premio** (modo `grand_prix` de
  `Ranking.jsx`): `getGrandPrixRanking(circuitId, year)` en
  `back/services/predictions.services.js`. Entre empatados en puntos, gana
  quien predijo antes la sesión "de desempate" (la última sesión del GP con
  `results` cargados; si ninguna tiene resultados, la última sesión del fin
  de semana). Si un usuario no predijo esa sesión, se usa su predicción más
  temprana del GP como fallback. La etiqueta que se muestra junto al gap
  (`QUALY`, `SPRINT`, etc.) refleja la sesión real de la que viene esa fecha
  por usuario (`sessionLabel`), no siempre la sesión "oficial" de desempate
  — antes mostraba siempre esta última aunque la fecha del usuario viniera
  del fallback de otra sesión (bug corregido 2026-10-24).

### Temporada vigente (título del podio del Home)
`utils/helpers.js` → `getSeasonYear(currentYearRaces, now)`: devuelve el año actual
si ya empezó su primer fin de semana (`date_gp_start <= ahora`), y si no, el
año anterior. Así, cuando en diciembre/enero se cargan las fechas del año
siguiente, el título "PUNTUACIÓN GLOBAL TEMPORADA {año}" del Home sigue mostrando
la temporada anterior hasta que arranca la primera carrera nueva. `Home.jsx` la
calcula con `RacesServices.findAllByYear(añoActual)`. Es solo el rótulo: los
puntos mostrados siguen siendo `stats.points.total` de los usuarios.

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
