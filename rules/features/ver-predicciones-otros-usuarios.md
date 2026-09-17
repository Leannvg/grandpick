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
| `front/src/pages/PredictionHistory.jsx` | Lee `userId` de la URL (`useParams`) y `name`/`last_name` del `state` de navegación (`useLocation`). Si hay `routeUserId`, pide el historial de ese usuario (`targetUserId = routeUserId \|\| userData._id`) y cambia el header a "Historial de {nombre}" + `BackButton` a `/ranking`. Sin `routeUserId` el comportamiento es idéntico al original ("Mi Historial"). |
| `front/src/pages/Ranking.jsx` | Modo `global`: dentro de `.user-info` de cada fila (salvo la del usuario logueado) se agrega `<button className="btn-view-history">` con ícono `bi-clock-history` que navega a `/prediction-history/:userId` pasando `{ name, last_name }` por `state`. |
| `front/src/assets/styles/ranking.css` | + `.btn-view-history`, `.btn-compare`. |

### Ranking por GP → comparar predicciones (modal)

Antes de esto se refactorizó `PredictionHistory.jsx`: el bloque de tabs de
sesión + tabla de comparación estaba duplicado (drawer mobile y panel
desktop). Se extrajo a dos componentes reutilizables:

| Componente | Ruta | Props | Notas |
|---|---|---|---|
| `SessionTabs` | `front/src/components/predictions/SessionTabs.jsx` | `sessions`, `selectedSessionType`, `onSelect` | Exporta también `getSessionButtonStatus(session)` (antes vivía duplicada en `PredictionHistory.jsx`). |
| `PredictionComparisonTable` | `front/src/components/predictions/PredictionComparisonTable.jsx` | `session`, `otherSession?`, `otherLabel?` | Sin `otherSession`: 4 columnas, igual al original. Con `otherSession`: 5 columnas (agrega "Predicción de {otherLabel}"), puntos de ambos lado a lado en la columna Puntos vía `.points-pill`. |

`PredictionHistory.jsx` ahora usa `<SessionTabs />` + `<PredictionComparisonTable session={currentSession} />` en los dos lugares donde antes estaba duplicado el JSX (sin `otherSession`, por lo que el resultado es visualmente idéntico al anterior).

Nuevo modal:

| Componente | Ruta | Props | Notas |
|---|---|---|---|
| `FloatingPredictionCompare` | `front/src/components/FloatingPredictionCompare.jsx` | `show`, `onClose`, `myUserId`, `myLabel`, `otherUserId`, `otherLabel`, `circuitId`, `year` | Mismo patrón visual que `FloatingDialog` (`gp-modal-overlay`/`gp-modal-card`), con `gp-modal-card--wide` (960px) para que entre la tabla de 5 columnas. Al abrir, pide en paralelo `PredictionServices.findHistoryByUser` de ambos usuarios, filtra cada uno por `circuitId` y renderiza `SessionTabs` (tabs según las sesiones del usuario propio) + `PredictionComparisonTable`. Maneja loading local (`LoaderSpinner`) y el caso sin predicciones para ese GP. |

`front/src/pages/Ranking.jsx` (modo `grand_prix`): nueva columna de acciones
(`<th className="w-50px">` sin texto + `<td>` con botón `.btn-compare`,
oculto en la fila del propio usuario) que abre el modal via
`compareTarget` (estado nuevo) y `profile` (estado nuevo, se guarda el
perfil que ya se pedía en `fetchStats`). `colSpan` de la fila vacía en modo
`grand_prix` pasó de `5` a `6` por la columna nueva.

## Decisiones de diseño propias

- **Puntos en la tabla de 5 columnas**: en vez de agregar columnas separadas
  "Tus puntos"/"Sus puntos" (que harían 6 columnas), se mantiene una sola
  columna "Puntos" con dos pills apiladas (`Vos: X` / `{otherLabel}: Y`),
  cada una coloreada con las mismas reglas de acierto/error que ya existían
  (`match`/`mismatch`), para no duplicar la lógica de columnas y mantener la
  tabla compacta en mobile.
- **Ubicación del botón "ver historial"** en el Ranking Global: dentro de
  `.user-info` (al lado del nombre/apellido), no como columna nueva, para no
  romper el layout de la tabla global (que ya tiene 7 columnas) y mantener el
  ícono cerca del dato al que aplica.
- **`FloatingPredictionCompare` usa loading local** (no `useLoader()` global)
  para no tapar toda la pantalla con el loader de carrera mientras el modal
  hace su fetch — sigue el mismo patrón que `FloatingEditProfile`.
