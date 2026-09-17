# Registro de cambios

Orden cronológico inverso (lo más nuevo arriba).

## 2026-09-16 · Resumen de usuario en el historial de predicciones

- `PredictionHistory.jsx` ahora muestra un panel (`.history-user-summary`)
  debajo del subtítulo, antes del buscador/tabs: Usuario, Predicciones
  totales, Aciertos y Puntos totales — para el usuario propio o el ajeno que
  se esté consultando. Usa `UsersServices.getUserStats(targetUserId)`
  (`GET /api/users/:id/stats`, ya sin restricción de ownership) en paralelo
  al historial, de forma best-effort.
- Estilos nuevos en `predictionHistory.css`: `.history-user-summary`,
  `.history-summary-item`, `.history-summary-label`, `.history-summary-value`.

## 2026-09-16 · Ver predicciones de otros usuarios (Ranking → historial y comparación)

- **Frontend**: dos entradas nuevas desde el Ranking para ver predicciones de
  otros usuarios (complementa el control server-side de la entrada anterior).
  - Ranking Global: ícono "ver historial" (`.btn-view-history`) en cada fila
    que navega a la nueva ruta `/prediction-history/:userId`, reutilizando
    `PredictionHistory.jsx` (ahora también soporta ver el historial de otro
    usuario vía `useParams`/`useLocation`, sin cambios de comportamiento para
    "Mi Historial").
  - Ranking por GP: columna de acciones con botón "Comparar" que abre el
    modal nuevo `FloatingPredictionCompare` (predicción propia vs. la del
    usuario elegido, para ese circuito).
  - Refactor: se extrajeron `SessionTabs` y `PredictionComparisonTable`
    (`front/src/components/predictions/`) desde el bloque duplicado
    (mobile/desktop) que tenía `PredictionHistory.jsx`, y se les sumó soporte
    opcional de comparación (`otherSession`/`otherLabel`, tabla de 5
    columnas) sin alterar el caso original de 4 columnas.
- Detalle completo: [features/ver-predicciones-otros-usuarios.md](./features/ver-predicciones-otros-usuarios.md).
- Componentes nuevos sumados a [componentes.md](./componentes.md):
  `SessionTabs`, `PredictionComparisonTable`, `FloatingPredictionCompare`.
- `npm run build` (front) compila sin errores.

## 2026-09-16 · Control server-side de visibilidad de predicciones ajenas

- **Backend**: hasta ahora el filtro de "sesión cerrada" para mostrar
  predicciones de otros usuarios era solo visual (frontend). Se agrega el
  control real en `back/services/predictions.services.js`:
  - `getUserPredictionHistory(userId, year, viewer)`, `findPredictionByUserAndRace(userId, raceId, viewer)`
    y `findPredictionsByUserId(userId, viewer)` ahora reciben un `viewer = { id, isAdmin }`
    y redactan/filtran las predicciones ajenas de sesiones que todavía no están
    cerradas (mismo criterio que `getSessionButtonStatus` del front).
  - `back/api/controllers/predictions.api.controllers.js` arma `viewer` desde
    `req.usuario` (`autenticado`) en `getHistoryByUserId`, `findByUserAndRace` y
    `findByUserId`.
- Detalle del criterio y las tres funciones: [logica.md](./logica.md#visibilidad-de-predicciones-ajenas-control-server-side).
- Probado contra la base real insertando y borrando una predicción temporal
  sobre una carrera sin resultados, confirmando redacción para viewers no
  dueños/no admin y visibilidad normal para dueño/admin/sesiones cerradas.

## 2026-09-16 · Agentes especializados de Claude Code

- `.claude/agents/grandpick-backend.md` y `.claude/agents/grandpick-frontend.md`:
  subagentes a nivel proyecto (quedan en el repo, no son de usuario) para
  trabajar en `back/` y `front/` respectivamente, cada uno con su propia
  arquitectura, convenciones y checklist de actualización de `rules/`.
- Documentado en `rules/estructura.md`.

## 2026-09-10 · Catálogo de componentes

- Nuevo `rules/componentes.md`: inventario de todos los componentes, contexts y
  hooks del front con sus props y notas de reuso.
- Convención agregada al `CLAUDE.md` y a `rules/README.md`: revisar el catálogo
  antes de crear un componente y sumar los nuevos al mismo.

## 2026-09-10 · Clasificación de pilotos

- **Backend**: nuevo endpoint público `GET /api/standings/drivers?year=` que arma
  la tabla de puntos del campeonato de pilotos a partir de los resultados
  cargados (`services/drivers.services.js` → `findDriversStandings`).
- **Frontend**: nueva vista `/standings` (`pages/Standings.jsx` +
  `assets/styles/standings.css`) con la tabla **Posición · Nombre · Nacionalidad ·
  Equipo Actual · Puntos**, reutilizando el diseño `ranking-*`.
- **Nav**: nuevo ítem **CLASIFICACIÓN** en el mega menú **F1 ACTUAL**.
- Regla: suman Carrera + Sprint; la Qualy no otorga puntos al campeonato.
- Detalle completo: [features/clasificacion-pilotos.md](./features/clasificacion-pilotos.md).
- **Docs**: se crea la carpeta `rules/` con la documentación viva del proyecto
  (estructura, diseño, lógica, features, este changelog).
