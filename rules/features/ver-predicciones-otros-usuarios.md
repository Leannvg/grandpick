# Feature · Ver predicciones de otros usuarios

**Fecha:** 2026-09-16
**Objetivo:** permitir consultar las predicciones de otros usuarios desde el
Ranking, tanto en la vista global (historial completo) como por Gran Premio
puntual (comparación lado a lado).

## Alcance

- **Ranking Global** (`/ranking`, modo `global`): cada fila (salvo la propia)
  suma un ícono "ver historial" que navega a `/prediction-history/:userId`,
  reutilizando `PredictionHistory.jsx`.
- **Ranking por GP** (`/ranking`, modo `grand_prix`): columna de acciones con
  botón **Comparar** que abre un modal (`FloatingPredictionCompare`) con la
  predicción propia vs. la del usuario elegido, para ese circuito.
- El front no valida qué sesiones se pueden ver: consume la API tal cual la
  devuelve. El filtro real de "sesión cerrada" para predicciones ajenas es
  server-side (ver [logica.md](../logica.md#visibilidad-de-predicciones-ajenas-control-server-side)).

## Backend

Ver entrada de backend en [logica.md](../logica.md#visibilidad-de-predicciones-ajenas-control-server-side)
y en el registro de cambios (control de visibilidad server-side en
`predictions.services.js` / `predictions.api.controllers.js`). El front no
necesitó cambios de firma: `PredictionServices.findHistoryByUser(userId, year)`
sigue igual, solo se le pasa el `userId` de otro usuario.

## Frontend

### Ranking Global → historial de otro usuario

| Archivo | Cambio |
|---|---|
| `front/src/App.jsx` | + ruta `/prediction-history/:userId` (mismo componente `PredictionHistory`, mismo patrón que `/teams/:id`). |
| `front/src/pages/PredictionHistory.jsx` | Lee `userId` de la URL (`useParams`) y `name`/`last_name` del `state` de navegación (`useLocation`) como fallback instantáneo. Si hay `routeUserId`, pide el historial de ese usuario (`targetUserId = routeUserId \|\| userData._id`), cambia el label a "Historial" (en vez de "Mi Historial") y el subtítulo a "Así fueron las predicciones de {nombre}...". Sin `routeUserId` el comportamiento es idéntico al original ("Mi Historial"). Solo cuando `routeUserId` está presente (viendo a otro usuario) pide además `UsersServices.getUserStats(targetUserId)` (`GET /api/users/:id/stats`, ya público para cualquier autenticado, sin restricción de ownership) y muestra un panel `.history-user-summary` (ancho 100%) debajo del subtítulo con Usuario / Predicciones totales / Aciertos / Puntos totales (`stats.predictions.total`, `stats.successes.total`, `stats.points.total` — los mismos totales ya visibles hoy en el Ranking Global). No se pide ni se muestra para "Mi Historial". El fetch de stats es best-effort (no bloquea ni rompe la carga del historial si falla). |
| `front/src/pages/Ranking.jsx` | Dentro de `.user-info` de cada fila (salvo la del usuario logueado) se agrega un ícono `.btn-row-action`: en modo `global` es `bi-clock-history` y navega a `/prediction-history/:userId` pasando `{ name, last_name }` por `state`; en modo `grand_prix` es `bi-arrow-left-right` y abre `FloatingPredictionCompare` (ver abajo). Un solo botón por fila, mismo lugar en ambos modos. |
| `front/src/assets/styles/ranking.css` | + `.btn-row-action` (ícono compartido por ambos modos). |

### Ranking por GP → comparar predicciones (modal)

Antes de esto se refactorizó `PredictionHistory.jsx`: el bloque de tabs de
sesión + tabla de comparación estaba duplicado (drawer mobile y panel
desktop). Se extrajo a dos componentes reutilizables:

| Componente | Ruta | Props | Notas |
|---|---|---|---|
| `SessionTabs` | `front/src/components/predictions/SessionTabs.jsx` | `sessions`, `selectedSessionType`, `onSelect` | Exporta también `getSessionButtonStatus(session)` (antes vivía duplicada en `PredictionHistory.jsx`). |
| `PredictionComparisonTable` | `front/src/components/predictions/PredictionComparisonTable.jsx` | `session`, `otherSession?`, `otherLabel?` | Sin `otherSession`: 4 columnas, igual al original (Pos \| Tu predicción \| Resultado real \| Puntos). Con `otherSession`: 6 columnas, orden **Pos \| Resultado real \| Tu predicción \| Puntos \| Predicción de {otherLabel} \| Puntos** — el resultado real va primero (después de Pos) y los puntos de cada usuario quedan pegados a la derecha de su propia columna de predicción. Cada predicción errada se marca en rojo de forma **individual** (`.cell-wrong` en esa celda puntual), nunca la fila completa, para no confundir cuando un usuario acierta y el otro no en la misma posición. |

`PredictionHistory.jsx` ahora usa `<SessionTabs />` + `<PredictionComparisonTable session={currentSession} />` en los dos lugares donde antes estaba duplicado el JSX (sin `otherSession`, por lo que el resultado es visualmente idéntico al anterior).

Nuevo modal:

| Componente | Ruta | Props | Notas |
|---|---|---|---|
| `FloatingPredictionCompare` | `front/src/components/FloatingPredictionCompare.jsx` | `show`, `onClose`, `myUserId`, `myLabel`, `otherUserId`, `otherLabel`, `circuitId`, `year` | Desktop (`isDesktop`, `window.innerWidth >= 1200`, con listener de `resize`): mismo patrón visual que `FloatingDialog` (`gp-modal-overlay`/`gp-modal-card`), con `gp-modal-card--wide` (960px) para que entre la tabla de 6 columnas, y cierre con Escape (`useEscapeKey`). Mobile: bottom-sheet deslizable (ver sección "Rediseño de título..." más abajo). Al abrir, pide en paralelo `PredictionServices.findHistoryByUser` de ambos usuarios, filtra cada uno por `circuitId` y renderiza `SessionTabs` (tabs según las sesiones del usuario propio) + `PredictionComparisonTable`. Maneja loading local (`LoaderSpinner`) y el caso sin predicciones para ese GP. |

`front/src/pages/Ranking.jsx` (modo `grand_prix`): el ícono `.btn-row-action`
(`bi-arrow-left-right`) vive junto al nombre del usuario dentro de
`.user-info` (mismo lugar que el ícono de historial del modo `global`, no una
columna aparte), oculto en la fila del propio usuario, y abre el modal vía
`compareTarget` (estado) y `profile` (estado, se guarda el perfil que ya se
pedía en `fetchStats`).

## Rediseño de título, cierre con Escape y bottom-sheet mobile (2026-09-16)

- **Título del modal**: se reemplazó el `<h2 className="gp-modal-title">
  Comparar predicciones: {myLabel} vs. {otherLabel}</h2>` plano por un
  encabezado tipo "VS" (`.gp-compare-title`): `{myLabel}` (resaltado en
  `--color-login`) — círculo "VS" (fondo `--color-red`) — `{otherLabel}` —
  y, debajo, el nombre del GP como subtítulo (`.gp-compare-subtitle`,
  `myCircuitData.circuit.gp_name` una vez que carga la data). Clases nuevas
  en `assets/styles/components.css`, junto a la familia `gp-modal-*`. Ver
  también la sección "Modales" en [diseno.md](../diseno.md).
- **Cierre con Escape (desktop)**: se creó `useEscapeKey(isActive, onEscape)`
  (`front/src/hooks/useEscapeKey.js`) y se aplicó en los 4 modales
  `Floating*` del proyecto: `FloatingDialog` (`onCancel`),
  `FloatingEditProfile`, `FloatingChangePassword` y
  `FloatingPredictionCompare` (estos tres con `onClose`). Ver
  [componentes.md](../componentes.md#hooks).
- **Bottom-sheet mobile**: por debajo de 1200px de ancho,
  `FloatingPredictionCompare` deja de mostrar el modal centrado y muestra un
  panel que sube desde abajo, replicando exactamente el patrón del drawer de
  `PredictionHistory.jsx` (mismo breakpoint `isDesktop`, mismo
  `framer-motion` con `drag="y"`, `dragConstraints={{ top: 0 }}`,
  `dragElastic={0.2}` y `onDragEnd` con umbral de 100px, mismo bloqueo de
  scroll del body vía `.body-scroll-lock`). Reutiliza tal cual
  `.history-drawer-overlay` y `.drawer-handle` de `predictionHistory.css`
  (por eso el componente ahora importa ese CSS); como el contenido no es un
  `<aside>` con lista de circuitos sino el título "VS" + `SessionTabs` +
  `PredictionComparisonTable`, se agregaron clases análogas propias:
  `.gp-compare-drawer` (contenedor del sheet), `.gp-compare-drawer-header`
  (título + subtítulo, sin el borde/handle que ya pone `.drawer-handle`) y
  `.gp-compare-drawer-body` (scroll interno de tabs + tabla). Se cierra
  tocando el overlay o arrastrando hacia abajo, sin botón "Cerrar" explícito
  (igual que el drawer de `PredictionHistory`).

## Decisiones de diseño propias

- **Orden de columnas en la tabla de comparación**: el resultado real se
  muestra primero (columna fija de referencia), seguido de cada predicción
  con sus puntos inmediatamente a la derecha, en vez de agrupar todos los
  puntos al final — así cada par predicción→puntos se lee de corrido.
- **Marca de error por celda, no por fila**: se eliminó la clase `no-match`
  a nivel fila del modo comparación (y las pills combinadas `Vos: X` /
  `{otro}: Y`); ahora cada celda de predicción (`.col-pred`/`.col-other-pred`)
  se pinta de rojo (`.cell-wrong`) de forma independiente cuando esa
  predicción puntual no acierta, y cada columna de puntos mantiene su propio
  color de acierto/error (`.col-points.match`/`.mismatch`, ya existente).
- **Ícono único por fila** en `Ranking.jsx`: en vez de una columna de
  acciones aparte para "Comparar", se usa el mismo lugar y la misma clase
  (`.btn-row-action`) que ya existía para "ver historial" en el Ranking
  Global, cambiando solo el ícono (`bi-arrow-left-right`) y la acción según
  el modo — mantiene el layout de ambas tablas sin columnas extra.
- **`FloatingPredictionCompare` usa loading local** (no `useLoader()` global)
  para no tapar toda la pantalla con el loader de carrera mientras el modal
  hace su fetch — sigue el mismo patrón que `FloatingEditProfile`.
