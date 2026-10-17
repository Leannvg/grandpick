# Ficha de piloto: estadísticas y ranking por sesión

Rediseño de `Profile.jsx`: además de predicciones/aciertos/puntos (ya existía), suma
estadísticas nuevas sobre las propias predicciones del usuario y su posición en el
ranking. Todo lectura; no genera predicciones, puntos ni notificaciones nuevas.

## Datos nuevos en `getUserWithStats` (`back/services/users.services.js`)

Se agregan a `stats`, sin tocar los campos que ya devolvía (`predictions`, `successes`,
`points`, `bestScores` — de los usa el Ranking tal cual):

- `podiums` / `poles`: `{ total, byCircuit: { [circuitId]: count } }`. Acierto exacto de
  posición 1-3 en `race`/`sprint` (podio) o posición 1 en `qualifying` (pole). Misma
  definición de acierto que `successes` (posición exacta, no "estuvo en el podio").
- `hitsByCircuit` / `pointsByCircuit`: aciertos y puntos agrupados por circuito (el
  segundo ya existía como `bestScores`, acá se expone también con la clave de
  circuito para poder mostrar "Aciertos totales por GP").
- `bestSession`: `{ successes, raceId, circuitId, type }` — la sesión con más aciertos.
- `failStreak`: sesiones cerradas seguidas sin ningún acierto, contando hacia atrás
  desde la más reciente.
- `mostPredictedDriver`: `{ driverId, trigram, count }` — piloto más elegido en los
  pronósticos (todas las predicciones, no solo las cerradas).
- `mostAccurateTeam`: `{ teamId, name, count }` — equipo con más aciertos, usando
  `results[].team` (el equipo con el que corrió el piloto esa carrera puntual). Mismo
  límite que constructores: carreras cargadas antes de que ese campo existiera no
  suman acá.
- `pointsLost`: `{ total, byMistakes, byMissedSessions }`.
  - `byMistakes`: suma, por cada posición pronosticada mal en una sesión cerrada, de
    los puntos que se hubieran ganado si esa posición fuera correcta.
  - `byMissedSessions`: suma del máximo posible (`points_system.points` completo) de
    cada sesión cerrada en la que el usuario no cargó ningún pronóstico.
  - Límite conocido: para un usuario que se unió a mitad de temporada, esto cuenta
    como "perdidas" sesiones anteriores a su alta. No hay forma de distinguirlo hoy.
- `ranking`: `{ position, total, bestPosition }` — posición global del usuario (leída
  de `Users.ranking_position`/`ranking_total`, no se recalcula acá) y su mejor
  posición en una sesión puntual (`bestPosition`, con `circuitId`/`type`/`rank`).
- `sessionRanking`: array de `{ raceId, circuitId, type, rank, total }`, una entrada
  por sesión cerrada que el usuario predijo (usa `Users_Points.rank`/`totalPlayers`).

## Ranking por sesión y ranking global (`back/services/points.services.js`)

No existía ranking por sesión individual (el único ranking de antes era la tabla
general de `Ranking.jsx`, acumulada de toda la temporada). Se agregó:

- `updateSessionRanking(raceId)`: ordena a los jugadores de **una** sesión por
  puntos de esa sesión, desempatando por fecha de pronóstico más temprana (mismo
  criterio que ya usaba `getGrandPrixRanking` en `predictions.services.js`, pero por
  sesión en vez de por GP completo). Guarda `rank`/`totalPlayers` en cada
  `Users_Points` de esa carrera.
- `updateGlobalRanking()`: recalcula la posición de **todos** los usuarios con el
  mismo desempate que ya usa `Ranking.jsx` en el frontend (puntos → aciertos →
  promedio por predicción → countback de mejores GP), portado a
  `compareForRanking()`. Guarda `ranking_position`/`ranking_total` en `Users`.
- Las dos se llaman al final de `updatePointsAfterRace(raceId)` — se recalculan
  **cuando un admin carga resultados**, no en cada visita a un perfil. Es la
  decisión de performance: lo que compara contra todos los usuarios se calcula una
  vez por carga de resultados (poco frecuente), no en cada vista de perfil (muy
  frecuente). Ver el resto de las estadísticas: son solo del propio usuario, así que
  esas sí se calculan al vuelo sin costo (no dependen de cuántos usuarios haya).
- `back/scripts/backfill-rankings.js`: carga inicial de `rank`/`ranking_position`
  para las sesiones ya jugadas antes de este cambio (sin `--apply` solo simula).
  Corrido una vez sobre producción: 40 sesiones, 39 usuarios.

## Bug encontrado (sin corregir)

En `updatePointsAfterRace`, la condición que debería aplicar el descuento de 1/3 a
los puntos de qualy anteriores al 2026-05-21 usa `race.type`, un campo que **no
existe** en `Races` (la sesión se identifica por `points_system`, ver
`rules/logica.md`). La condición nunca es verdadera, así que ese descuento nunca se
aplicó. No se corrigió como parte de este cambio porque implica decidir si se
recalculan los puntos ya otorgados — pendiente. El cálculo nuevo de `pointsLost`
(este cambio) sí usa el tipo real (`points_system.type`), así que no reproduce el bug,
pero por eso puede no coincidir exactamente con los puntos históricos ya otorgados
en sesiones de qualy viejas.

## Frontend (`front/src/pages/Profile.jsx`, `front/src/assets/styles/profile.css`)

- Layout de dos columnas: identidad (izquierda, fija al hacer scroll en desktop) y
  estadísticas (derecha), cada bloque en un panel único (`background:
  var(--color-dark-blue)`, sin borde — igual que `.stats-section` ya usaba).
  Reemplaza el diseño anterior (una columna centrada, tres anillos sueltos).
- "Rendimiento": los tres anillos (predicciones/aciertos/puntos) con desglose fijo
  por Qualy/Sprint/Race debajo de cada uno (antes solo se veía en el hover del
  gráfico). `cutout: "70%"` (antes 85%, más fino).
- "Resumen": 9 estadísticas en tarjetas chicas con fondo propio, en grilla fija
  (no `flex-wrap`, para que las columnas no queden desalineadas entre filas).
- "Evolución en la temporada": dos gráficos (puntos por GP y posición en el ranking
  de carrera por GP) en un mismo panel. El eje de posición se ajusta al rango que el
  usuario realmente usó, no de 1 al total de jugadores — si no, un cambio de 1-2
  puestos sería invisible con muchos jugadores.
- "Por Gran Premio": dos desplegables (Posición final, Aciertos totales), con filas
  separadas por una línea fina (mismo patrón que las sesiones del calendario,
  `cal-session`), no tarjetas individuales. Misma animación de apertura que el panel
  de horarios del calendario (`grid-template-rows` 0fr→1fr + fade escalonado de las
  filas), portada a React en `GpFold` (componente local de `Profile.jsx`, no
  extraído como reutilizable todavía).
- Avatar: `getImageUrl(img, 800)` (no 400 ni 500) — ver
  `rules/registro-de-cambios.md` y la nota de memoria sobre el tamaño de foto.
- Banderas: `CountryDisplay` (ya existente), no imágenes nuevas.
- "Miembro desde": se deriva del timestamp embebido en el `_id` de Mongo
  (`parseInt(id.slice(0,8),16)*1000`), no hay un campo de fecha de alta en `Users`.
- Trigrama: primeras 3 letras del apellido (`usuario.last_name`), no iniciales de
  nombre y apellido.
- CSS con prefijo `fp-` en el contenedor raíz y selectores descendientes (mismo
  criterio que `cal-` en `calendar.css`), para no chocar con clases genéricas de
  otras páginas.

## Pendiente / no incluido en este cambio

- Decidir si se corrige el bug del descuento de qualy, y si se recalculan puntos
  históricos.
- `GpFold` no está extraído como componente reutilizable (hoy es local a
  `Profile.jsx`); si se necesita en otra pantalla, sumarlo a `componentes.md`.
