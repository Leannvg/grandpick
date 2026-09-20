# Registro de cambios

Orden cronológico inverso (lo más nuevo arriba).

## 2026-09-20 · Confeti también en el 2º y 3º del podio

- `Confetti` gana props `seed`, `speed` y `roundRatio` para variar cada
  instancia. Misma paleta de colores en las tres tarjetas (el podio se
  comparte; con colores propios por puesto el blanco/gris del 2º se perdía sobre
  el fondo plateado). 1º: mixto; 2º: círculos, más lentos; 3º: tiras, más rápidas.

## 2026-09-20 · Podio del Home: animaciones constantes

- Se quita el zoom de entrada de la foto de perfil.
- Nuevo brillo que barre cada tarjeta en loop (`.podium__shine`, `framer-motion`,
  desfasado por puesto) y confeti cayendo infinitamente en la tarjeta del 1º.
- Nuevo componente `Confetti` (`components/Confetti.jsx`), documentado en
  `componentes.md`. Ambos efectos se desactivan con `prefers-reduced-motion`.

## 2026-09-20 · Animaciones en el podio del Home (regla: framer-motion)

- Las tarjetas del podio (`Home.jsx`) pasan a `motion.div`: entrada escalonada
  al entrar en pantalla (fade + subida, 3º → 2º → 1º), foto con `scale` y
  elevación al hover. Respeta `prefers-reduced-motion` (`useReducedMotion`).
- Nueva sección "Animaciones" en `rules/diseno.md`: `framer-motion` es el estándar
  para animar UI en el proyecto.

## 2026-09-20 · Podio del Home como tarjetas estilo F1/F2

- El podio (`Home.jsx` + `home.css`) reemplaza escalones/pedestales por tres
  tarjetas inspiradas en los podios oficiales de F1/F2: fondo en degradé del
  color del puesto (`--color-pos1/2/3`) con rayas diagonales, posición `1º`
  arriba, nombre y **apellido** en un renglón, bandera, puntos grandes abajo y
  foto de perfil a la derecha.
- Mobile: tarjetas apiladas 1º · 2º · 3º. Desktop: 2º · 1º · 3º alineadas abajo,
  con el 1º más alto. Sin componentes nuevos.
- Ajuste: la foto de perfil pasa a ser un cuadrado con borde blanco y esquinas
  redondeadas (como en "Mi perfil") en vez de estirarse a todo el alto, para
  que las imágenes chicas no se pixelen. Queda anclada arriba a la derecha
  (no centrada verticalmente).

## 2026-09-20 · Podio del Home: escalones con luz de pista

- Nuevo look del podio (`home.css`, sin cambios en `Home.jsx`): los pedestales
  pasan de bloques de color sólido metalizado a paneles oscuros translúcidos
  con cara superior 3D (trapecio) y número/puntos en el color del puesto.
- Mismos tokens `--color-pos1/2/3`; sin componentes nuevos.
- Ajuste posterior: se quitó el foco de luz del 1º; nombre y apellido en un
  solo renglón; los puntos pasan debajo del nombre (más grandes) y el escalón
  queda solo con la posición (`Home.jsx` + `home.css`).

## 2026-09-20 · Podio del Home a todo el ancho con pedestales

- El podio de "TOP 10 - PUNTUACIÓN GLOBAL" (`Home.jsx`, estilos en `home.css`)
  pasa de tres avatares sueltos y centrados a una grilla de 3 columnas que ocupa
  todo el ancho del contenedor. Orden visual 2º · 1º · 3º.
- Cada puesto tiene avatar circular (bandera superpuesta en la esquina), nombre
  y un pedestal de distinta altura (1º más alto) con el número de posición
  grande y los puntos totales. Color del pedestal/borde por posición con los
  tokens existentes `--color-pos1/2/3`; el 1º suma un leve resplandor dorado.
- Un solo set de reglas responsive (mobile base + ajuste de tamaños en
  `min-width: 992px`); se eliminó la duplicación previa. Sin componentes nuevos.

## 2026-09-17 · Botones de historial/comparar con el diseño del botón de confirmar

- `.btn-row-action` (íconos "ver historial" y "comparar" del Ranking) pasa
  de ícono fantasma (sin fondo) a círculo sólido azul con ícono blanco
  (`#4c86b7`, hover `#357abd`) — el mismo diseño de color y fondo que
  `.submit-btn`/`SubmitButton`, el botón circular de confirmar que ya se
  usa en login, registro y predicciones.

## 2026-09-17 · Fix: labels en rojo no deseado + tabla rota en mobile

- **Fix de regresión**: al definir `--color-red` (commit anterior) dos
  labels que dependían de que esa variable estuviera *sin definir* (y por
  lo tanto heredaban el blanco del contenedor) pasaron a verse en rojo:
  `.status-label` del panel "Tu puesto" en `Ranking.jsx` y
  `.history-summary-label` del resumen de `PredictionHistory.jsx`. Se
  cambian ambos a `rgba(255,255,255,0.65)` explícito — un blanco atenuado
  pensado para captions sobre fondo oscuro, en vez de depender de que una
  variable quede sin resolver. `--color-red` se mantiene definida (la sigue
  usando el badge "VS" y `.auth-link-bold`, donde sí es el rojo buscado).
- **Fix: tabla de comparación rota en mobile**: la tabla de 6 columnas se
  achicaba con `1fr` hasta romperse en pantallas angostas (nombres
  cortados, última columna de puntos recortada fuera de la tarjeta). Se
  reemplaza por el mismo criterio que ya usa `ranking-table-container` en
  el resto del proyecto: la tabla obtiene un `min-width: 640px` y su
  contenedor (`.prediction-comparison-table-scroll`, nuevo wrapper en
  `PredictionComparisonTable.jsx`) scrollea horizontalmente en vez de
  achicar el contenido.
- **Mejora de diseño**: el badge "VS" crece (36px → 46px), suma borde
  blanco translúcido y sombra para destacar más. El subtítulo del GP
  (`.gp-compare-subtitle`) deja de ser solo el nombre y ahora muestra
  bandera del circuito + nombre + fecha del fin de semana (`getFlagEmoji` +
  `formatRaceDate`, ya usados en el resto del proyecto).
- Detalle: [features/ver-predicciones-otros-usuarios.md](./features/ver-predicciones-otros-usuarios.md).

## 2026-09-16 · Título rediseñado, cierre con Escape y bottom-sheet mobile en el comparador

- **`FloatingPredictionCompare`**: el título plano (`<h2>Comparar
  predicciones: X vs. Y</h2>`) se reemplaza por un encabezado tipo "VS"
  (`.gp-compare-title`: `{myLabel}` — círculo "VS" en `--color-red` —
  `{otherLabel}`), con el nombre del GP como subtítulo (`.gp-compare-subtitle`)
  una vez que se cargan los datos. Clases nuevas en
  `assets/styles/components.css`, junto a la familia `gp-modal-*`.
- **Cierre con Escape (desktop)**: nuevo hook `useEscapeKey(isActive,
  onEscape)` (`hooks/useEscapeKey.js`), aplicado en los 4 modales
  `Floating*` que comparten el patrón `gp-modal-overlay`/`gp-modal-card`:
  `FloatingDialog` (con `onCancel`), `FloatingEditProfile`,
  `FloatingChangePassword` y `FloatingPredictionCompare` (estos tres con
  `onClose`).
- **Bottom-sheet mobile en `FloatingPredictionCompare`**: por debajo de
  1200px de ancho (`isDesktop = window.innerWidth >= 1200`, mismo
  breakpoint/patrón que el drawer de `PredictionHistory.jsx`), el modal
  centrado se reemplaza por un panel que sube desde abajo (`framer-motion`,
  `drag="y"`, cierre por arrastre >100px u overlay). Reutiliza
  `.history-drawer-overlay` y `.drawer-handle` de `predictionHistory.css`
  (por eso ahora se importa ese CSS en el componente) y agrega clases
  análogas propias (`.gp-compare-drawer`, `.gp-compare-drawer-header`,
  `.gp-compare-drawer-body`) porque el contenido no es un `<aside>` de
  circuitos sino `SessionTabs` + `PredictionComparisonTable`. En desktop no
  cambia nada del flujo, solo el título.
- **Bugfix de revisión**: `--color-red` se usaba en varios lugares del
  proyecto (`globals.css` en `.status-label` del Ranking, y en
  `.history-summary-label` agregado en el cambio anterior) pero **nunca
  estaba definida** en `:root` — con el círculo "VS" nuevo (`background:
  var(--color-red)`) el problema se volvía visible (círculo transparente en
  vez de rojo). Se agrega `--color-red: #E10600` a `globals.css` (mismo
  valor que ya se usaba como fallback en `admin.css`), lo que de paso
  corrige el color de esos otros dos usos previos.
- **Ajuste de revisión**: `.gp-compare-name--me` (el nombre propio en el
  título "VS") usa `--color-login` (celeste claro, pensado para el modal
  oscuro); en el bottom-sheet mobile (fondo claro) se sobreescribe a
  `--color-confirm` para mantener contraste legible.
- Detalle: [features/ver-predicciones-otros-usuarios.md](./features/ver-predicciones-otros-usuarios.md).

## 2026-09-16 · Ajustes al comparador de predicciones

- **Ranking por GP**: el botón "Comparar" deja de ser una columna aparte y
  pasa a ser un ícono (`bi-arrow-left-right`, clase `.btn-row-action`) junto
  al nombre del usuario, en el mismo lugar donde el Ranking Global ya
  mostraba el ícono de "ver historial" (`bi-clock-history`) — ambos ahora
  comparten la misma clase CSS.
- **Tabla de comparación** (`PredictionComparisonTable`, modo con
  `otherSession`): se reordenan las columnas a Pos → Resultado real → Tu
  predicción → Puntos → Predicción del otro → Puntos (antes el resultado
  real iba después de las dos predicciones y los puntos de ambos quedaban
  agrupados al final). Se elimina el pintado en rojo de la fila completa
  (`no-match`) y las pills combinadas de puntos; ahora cada predicción
  errada se marca en rojo de forma individual por celda (`.cell-wrong`),
  para no confundir cuando un usuario acierta y el otro no en la misma fila.
- Detalle: [features/ver-predicciones-otros-usuarios.md](./features/ver-predicciones-otros-usuarios.md).

## 2026-09-16 · Resumen de usuario en el historial de predicciones

- `PredictionHistory.jsx` ahora muestra un panel (`.history-user-summary`,
  ancho 100%) debajo del subtítulo, antes del buscador/tabs: Usuario,
  Predicciones totales, Aciertos y Puntos totales — **solo al consultar el
  historial de otro usuario**, nunca en "Mi Historial". Usa
  `UsersServices.getUserStats(targetUserId)` (`GET /api/users/:id/stats`, ya
  sin restricción de ownership), pedido únicamente cuando hay `routeUserId`.
- Ajuste de copys: viendo a otro usuario, el label pasa de "Historial de
  {nombre}" a "Historial", y el subtítulo cambia a "Así fueron las
  predicciones de {nombre} en los anteriores GP" (antes usaba el mismo texto
  que "Mi Historial" para ambos casos).
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
