# Registro de cambios

Orden cronológico inverso (lo más nuevo arriba).

## 2026-10-03 · Columna de posición unificada como «#»

- Encabezado de la columna de posición en todas las tablas: «#» (antes «Pos.»
  en Home y Ranking, «Posición» en Campeonato de pilotos y constructores, y
  «Pos» en la comparación de predicciones).
- Archivos: `Standings.jsx` (x2), `Home.jsx`, `Ranking.jsx`,
  `PredictionComparisonTable.jsx` (x2). Las tablas del admin no tienen columna
  de posición.

## 2026-10-03 · Botones de acción de fila en outline + íconos con caja exacta

- `ranking.css`: `.btn-row-action` (comparar / historial en las filas) pasa a
  outline azul (`#4c86b7`, borde y texto, fondo transparente), en vez del
  círculo sólido. Mismo criterio que el botón Compartir. El outline azul y no
  blanco porque la tabla tiene filas blancas.
- `globals.css`: `.bi` pasa a `display: inline-flex` con centrado. Medido en
  el navegador: con solo `line-height: 1` el `<i>` medía 17px para un glifo
  de 16px (el `::before` alineado a la línea base dejaba un extra abajo, por
  eso el ícono parecía subido). Con la regla nueva la caja mide 16×16.

## 2026-10-03 · Modales: sin blur en el fondo (parpadeo al abrir y cerrar)

- `components.css`: se quitó `backdrop-filter: blur(4px)` de
  `.gp-modal-overlay`. Chrome re-pintaba el blur del fondo cuando la página
  cambiaba debajo (el loader cambia la altura de `main` al confirmar), y eso
  se veía como un parpadeo. El fondo sigue oscuro (`rgba(0,0,0,.7)`).
- Verificado en un harness con `FloatingDialog` idéntica: el overlay se monta
  una sola vez y se desmonta con su animación de salida, sin remontarse. Por
  eso el arreglo apunta al blur y no al `AnimatePresence`. Otros
  `backdrop-filter` del proyecto (badges, nav, banner de predicción) no se
  tocaron.

## 2026-10-05 · Prácticas (FP1–FP3): colección, carga en RaceForm y panel

- Nueva colección `Practice_Sessions` (`id_circuit`, `year`, `name` FP1/FP2/FP3, `date_utc`). Se guarda en UTC igual que `date_race`.
- Backend: `GET /api/practice-sessions?year=&circuitId=` (público) y `PUT /api/dashboard/practice-sessions/:circuitId/:year` (admin, reemplaza las prácticas de ese circuito y año). Servicio `services/practiceSessions.services.js`, controlador y rutas `practiceSessions.api.*`.
- `RaceForm.jsx`: sección «Prácticas». Se ingresa en hora del circuito y se convierte a UTC con luxon al guardar. Solo se reemplazan si el admin las tocó.
- Calendario: las prácticas aparecen como grupo «Prácticas» (Práctica 1–3, 60 MIN.). Sin datos cargados, el grupo no aparece.
- Clasificación sprint: `name` `SQ` en `Practice_Sessions` (solo fines de semana sprint). El calendario la muestra en «Fin de semana sprint» (45 MIN.) y reemplaza a la regla por fecha si existe.
- Carga 2026: script `back/scripts/import-practice-sessions-2026.js` (sin `--apply` simula) con datos de `back/data/practice-sessions-2026.json`. Valida cada clasificación contra `Races` antes de guardar: 23 GP, 23 FP1, 17 FP2, 17 FP3 y 6 SQ.
- Corregida la zona del circuito de Australia: `Australia/Adelaide` → `Australia/Melbourne`.
- Detalle en `rules/features/practicas.md`.

## 2026-10-04 · Calendario: clasificación mal rotulada como carrera


- En `points_system` la clasificación se guarda como `qualifying` (no `qualy`);
  el panel la mostraba como «Carrera». `CalendarCard.jsx` ahora normaliza ambos
  valores (`normalizeType`).

## 2026-10-04 · Calendario: estado «Próximo» morado y país más grande

- La próxima carrera muestra «Próximo» en morado hasta su fecha de inicio (en
  la zona del circuito). Desde esa fecha pasa a «En curso», también morado. Las
  siguientes siguen en rojo con «Próximo».
- Tamaño de país y bandera aumentado en la tarjeta.

## 2026-10-04 · Calendario: títulos de grupo y duraciones genéricas

- El panel agrupa las sesiones en «Fin de semana sprint» (solo si hay sprint) y
  «Clasificación y carrera». La clasificación anterior al sprint se muestra como
  «Clasificación sprint».
- Duraciones genéricas por tipo (`DURATION` en `CalendarCard.jsx`): práctica 60
  MIN., clasificación 60 MIN., clasificación sprint 45 MIN., sprint 35 MIN.,
  carrera 2 HS.
- El título «Prácticas» queda pendiente: aparece cuando existan los datos de
  prácticas.

## 2026-10-04 · Calendario: alineación a la izquierda y duración por sesión

- La página de calendario tiene `text-center` en la sección y las tarjetas lo
  heredaban (nombre de circuito y filas de sesión quedaban centradas). `.cal-card`
  ahora tiene `text-align: left`; la fecha sigue centrada.
- Duración por tipo de sesión en `CalendarCard.jsx` (`SESSION_DURATION`):
  carrera 2 HS., sprint 35 MIN., clasificación 60 MIN. Son valores aproximados
  mientras la base no guarde la duración real.

## 2026-10-04 · Calendario: tarjetas nuevas con panel de sesiones

- Nuevo `components/calendar/CalendarCard.jsx` y `assets/styles/calendar.css`
  (prefijo `cal-`). `Calendar.jsx` renderiza estas tarjetas en dos columnas.
- Riel con el número de ronda (`1º`, `2º`…), fecha con estado centrado debajo
  del mes (`Finalizado` / `En curso` / `Próximo`), fechas siempre con dos cifras.
- El reloj abre el panel de sesiones con altura animada (`grid-template-rows`),
  el ícono gira a X y las filas entran con un fade escalonado. Con
  `prefers-reduced-motion` no hay animación.
- Cada tarjeta tiene su propio switch «Mi tiempo / Tiempo de circuito»: cambiar
  una no afecta a las demás. El estado no se guarda al recargar.
- Las sesiones que se muestran son las de `Races` (carrera, sprint y
  clasificación). Las prácticas y la duración todavía no están: quedan para la
  siguiente etapa (colección de prácticas y carga en `RaceForm`).
- Las clases viejas del calendario (`.race-date`, `.schedule-overlay`, etc.) en
  `components.css` ya no se usan; sacarlas queda pendiente.

## 2026-10-03 · Botones «Volver a…» sin forma de botón

- `components.css`: `.breadcrumb-link` pasa a solo texto con flecha (sin
  fondo, borde ni padding). En hover queda el cambio a blanco y un
  desplazamiento de 3px.

## 2026-10-03 · Historial de otro usuario: el loader espera también las estadísticas

- `PredictionHistory.jsx`: `getUserStats` se pedía con `.then` sin esperarlo,
  así que el loader se apagaba antes de que llegaran los datos del usuario
  (cabecera con nombre, predicciones, aciertos y puntos). Ahora historial y
  estadísticas se piden juntos con `Promise.all` y el loader se oculta cuando
  están los dos. Si las estadísticas fallan, se loguea y el historial se muestra
  igual.

## 2026-10-03 · Modales sin framer-motion (entrada y salida con CSS)

- Nuevo hook `hooks/useModalPhase.js` (`open` / `closing` / `closed`): al
  cerrar espera 200ms antes de desmontar, para que la salida se vea.
- `FloatingDialog`, `FloatingChangePassword` y `FloatingEditProfile` pasan a
  transiciones CSS (`.gp-modal-overlay--css`, keyframes `gp-modal-*` en
  `components.css`). `FloatingEditProfile` pierde el leve desplazamiento
  vertical de su entrada: ahora es solo escala.
- `FloatingPredictionCompare`: modal de escritorio y drawer de mobile pasan a
  CSS con `useModalPhase`. El drawer mantiene el arrastre para cerrar, ahora
  con eventos de puntero (`onPointerDown/Move/Up`) sobre el tirador y el
  encabezado, sin framer-motion.
- `FloatingAlert` (toast) pasa a CSS (`.global-alert--css`, 300ms de salida).
- Todos los `Floating*` quedan sin framer-motion. Fuera de esa lista quedan
  `Reveal`, el podio y los drawers de `PredictionHistory` e `InformationPage`.
- Motivo: el parpadeo al confirmar predicciones y en la edición de carrera
  no se logró aislar; esta es la prueba para descartar framer como causa.

## 2026-10-03 · Podio: fotos en desktop del mismo tamaño que en mobile

- `podium.css`: se quitaron los overrides de `--podium-photo` del bloque
  `min-width: 992px` (130/160/120px). Ahora desktop hereda los de mobile:
  110px para 2º y 3º, 136px para el 1º. Las alturas de tarjeta en desktop
  no cambian.

## 2026-10-03 · Ranking: botón de acción de la fila a la izquierda del nombre

- `Ranking.jsx`: el botón de la fila (comparar en Gran Premio, historial en
  Global, que ocupa el mismo lugar) pasa antes del nombre, dentro de
  `.user-info`. Se movió en ambos modos para que quede igual en todas las
  filas.

## 2026-10-03 · Íconos Bootstrap Icons centrados verticalmente

- `globals.css`: `.bi { line-height: 1; }`. El `<i>` heredaba el
  `line-height` del body (1.5) y dejaba un strut de texto debajo del glifo,
  por eso parecía correrse hacia arriba dentro de botones y círculos (p. ej.
  el de comparar en el ranking). Verificado con captura ampliada 6x: el
  glifo pasa de quedar ~3px arriba a quedar centrado en un botón de 28px.
- Documentado en `diseno.md` (sección Iconos).

## 2026-10-03 · Ranking: modo, circuito y año en la URL + botón "Compartir"

- `Ranking.jsx`: el modo (`Global` / `Por Gran Premio`) ahora son `Link` con
  `?mode=global|grand_prix` (mismo criterio que los tabs del panel admin con
  `?tab=`), y el modo se lee de la URL (atrás/adelante funcionan). Circuito
  (`gp`) y año (`year`) también viajan en la URL: un effect los sincroniza con
  el estado con `replace`, solo si cambió.
- Botón "Compartir" (visible en modo Gran Premio con circuito elegido): copia
  la URL actual al portapapeles con `useAlert`. Va arriba del podio, alineado
  a la derecha, con icono `bi bi-share-fill` (Bootstrap Icons, como el resto
  de la app) y estilo `btn-outline-light` para diferenciarlo de los toggles.
- Los toggles `Global` / `Por Gran Premio` (ahora `Link`) llevan
  `text-decoration-none` para que no tengan subrayado de link.
- Decidido: el ranking **sigue requiriendo cuenta**. El link compartido solo
  lo abre quien tenga login. Nota técnica: `/api/users-stats` y
  `/api/ranking/circuit/...` no piden auth, pero `Ranking.jsx` llama primero
  a `getUserProfile()`, así que un anónimo recibe 401 y `apiFetch` lo manda a
  `/login`. Si más adelante se quiere público, hay que hacer opcional esa
  llamada y ocultar «Tu puesto» y «Comparar».

## 2026-09-29 · Ajustes al confeti CSS + brillo del podio también a CSS nativo

- `Confetti.jsx`/`podium.css`: al arrancar, las piezas se veían todas
  amontonadas arriba antes de empezar a caer — faltaba
  `animation-fill-mode: backwards` en `.confetti__piece`, así que durante
  el `animation-delay` de cada pieza se mostraba su posición de reposo
  (arriba, sin transformar) en vez de ya arrancar en el estado inicial del
  keyframe (arriba, invisible). Agregado.
- `Podium.jsx`/`podium.css`: el brillo (`.podium__shine`) usaba el mismo
  patrón de `framer-motion` + `repeat: Infinity` que el confeti, y tenía el
  mismo problema (no se veía nunca). Se pasó a CSS nativo igual que el
  confeti: `@keyframes podium-shine`, `animation-delay` distinto por puesto
  vía la variable CSS `--shine-delay` y la misma duración de ciclo (4.9s =
  1.4s de barrido + 3.5s de pausa) para los tres — como tienen el mismo
  período, quedan sincronizados para siempre y barren en orden
  1º → 2º → 3º en cada vuelta del loop, no solo la primera vez.

## 2026-09-29 · Confeti del podio: pasar el loop a CSS nativo (fix definitivo)

- El remount cada 6s (entrada de abajo) tampoco resolvió el problema: se
  verificó en vivo, 3 chequeos separados por varios segundos, que el
  `transform` de las piezas no cambiaba nunca (siempre en el frame final),
  a pesar de confirmar por el bundle desplegado (buscando el literal `KV=6e3`
  minificado) que el código del remount SÍ estaba corriendo en producción.
  Antes de eso también se descartó una falsa pista: comparar el hash del
  bundle local (Windows) contra el de Vercel (Linux) no es una forma válida
  de detectar staleness — esos hashes pueden diferir por plataforma aunque
  el código sea idéntico.
- Se sacó el loop del confeti de `framer-motion` (`repeat: Infinity`) por
  completo. `Confetti.jsx` ahora renderiza `<span>` planos (sin
  `motion.span`) con una animación CSS nativa: `@keyframes confetti-fall`
  en `podium.css`, `animation-iteration-count: infinite`, ángulo de
  rotación variable por pieza vía la CSS custom property `--confetti-spin`
  (seteada inline por pieza). Sigue respetando `useReducedMotion()`.
- Se sacó también el `useState`/`setInterval` del remount-cada-6s (ya no
  hace falta: el loop nativo no depende de React para seguir corriendo).
- Regla documentada en `diseno.md`: para loops infinitos puramente
  decorativos, usar CSS nativo en vez de `framer-motion` — es la única
  excepción a la regla general del proyecto de animar todo con
  `framer-motion`.

## 2026-09-29 · Confeti del podio: remontar periódicamente (salvaguarda)

- El fix de memoización (entrada de abajo) tampoco alcanzó: se instrumentó
  `Confetti.jsx` con logs temporales de render/mount y se confirmó en
  producción que cada instancia monta **una sola vez** y **no vuelve a
  re-renderizar ni desmontarse** — y aun así, con mount 100% limpio, la
  animación terminó igual congelada (`el.getAnimations()` vacío, estilo
  fijo en el último frame de la animación).
- No se logró aislar la causa real: el mismo código (memoizado, con
  `transform` en vez de `top`) corrió sin problema más de 20s seguidos en
  un harness aislado (esm.sh + React 18.3.1 + framer-motion 12, las mismas
  versiones del proyecto), pero se congela igual en la página real. Se
  descartan como causa: layout vs. transform, objetos recreados por render,
  y re-renders/remounts del componente.
- Se aplicó una salvaguarda pragmática en `Confetti.jsx`: las piezas se
  remontan cada `RESET_INTERVAL_MS` (6s) cambiando el `key` del contenedor
  vía `setInterval`. No es un fix de causa raíz — es una recuperación
  automática para que, pase lo que pase, el confeti no quede detenido para
  siempre. Se sacaron los logs de diagnóstico temporales.

## 2026-09-29 · Confeti del podio: memoizar `initial`/`animate`/`transition`

- El primer intento (cambiar `top` por `y`/`transform`) no resolvió el
  problema — confirmado en vivo con `el.getAnimations()` en DevTools: la
  pieza no tenía ninguna animación activa (array vacío), congelada con el
  estilo del último frame, incluso recién refrescada la página.
- Causa más probable: `Confetti.jsx` armaba los objetos `initial`/`animate`/
  `transition` de cada pieza inline en el JSX (nuevos en cada render), y
  `Podium.jsx` hacía lo mismo para `.podium__shine`. Un objeto nuevo por
  render puede hacer que Framer Motion reinicie la animación; con varios
  renders seguidos (ej. `profile` → `stats` → `countriesMap`, cada uno con
  su propio `await` en el mismo efecto de `Ranking.jsx`) puede terminar
  cancelada sin volver a correr un segundo ciclo.
- Se movieron esos objetos a un `useMemo` junto con el resto de la pieza
  (`Confetti.jsx`) y a constantes de módulo (`Podium.jsx`,
  `SHINE_TRANSITION_BY_RANK`, mismo patrón que `CONFETTI_BY_RANK`), para que
  mantengan referencia estable entre renders.
- No se pudo reproducir el freeze exacto en un harness aislado (ni con el
  código viejo forzando 3 renders seguidos cerca del mount), así que esto es
  el diagnóstico mejor sustentado con la evidencia disponible, no una
  reproducción 100% confirmada — a verificar en vivo después de este deploy.
- Regla general documentada en `diseno.md` (sección Animaciones).

## 2026-09-29 · Corrección: el fix de alineación era el equivocado

- El diagnóstico de la entrada anterior (2026-09-28) estaba mal: los labels
  **sí** van centrados (`.gp-input-label` vuelve a `justify-content: center;
  text-align: center`, como estaba antes). Lo que realmente se veía corrido
  al centro era el **placeholder/valor del `CountrySelect`** ("Selecciona un
  país"), no el label.
- Causa real: los `<input>` (`.form-control`) tienen `text-align: start` por
  default del navegador y no heredan el `text-align: center` del contenedor
  `.text-center` (`.auth-section` en Login/Register) — por eso Nombre,
  Apellido, Email y Contraseña ya se veían bien. Pero los `<div>` que arma
  `react-select` para el placeholder/valor (`.react-select__placeholder`,
  `.react-select__single-value`) no tienen ese default y sí heredan el
  centrado del contenedor. Verificado con `getComputedStyle` en un HTML
  aislado (`agent-browser`) antes de tocar el CSS, para no repetir el
  diagnóstico apurado de la entrada anterior.
- Fix real: `text-align: left` en `.react-select__value-container`
  (`components.css`), que cubre placeholder/valor/input por herencia. No
  afecta a otros usos de `SearchableSelect` fuera de contenedores
  `.text-center` (ahí ya se comportaba bien, este `text-align: left` es
  redundante pero inofensivo).

## 2026-09-28 · Fix alineación de labels y botón deshabilitado en Register

- **Fix**: `.gp-input-label` (`components.css`) tenía `text-align`/
  `justify-content: center`, afectando a todos los formularios del proyecto
  (Login, Register, ForgotPassword, admin). Se notaba solo en labels cortos
  como "País" en `CountrySelect` dentro de `Register.jsx`. Se cambia a
  `flex-start`/`left` de forma global — consistencia real, no un parche
  puntual.
- **`Register.jsx`**: se evaluó agregar `LoaderCar` (pantalla de carga) entre
  la confirmación del modal y el redirect a `/login`; se descartó por ser un
  único request rápido y porque `Login.jsx` sigue el mismo flujo (confirmar →
  submit → toast + redirect) sin loader — agregarlo solo acá rompía la
  simetría. En cambio, se agrega estado `isSubmitting`: el botón "Crear
  cuenta" (`submit-btn`) se deshabilita mientras la request está en curso
  (evita doble submit), con estilo `.submit-btn:disabled` nuevo
  (`opacity: 0.6`, mismo criterio que `.gp-btn-confirm:disabled`).

## 2026-09-28 · Navegación directa en botones "F1 ACTUAL" y "TUTORIALES"

- `Nav.jsx`: los botones padre de los mega menús no navegaban a ninguna
  pantalla, solo desplegaban el submenú. Ahora, en **desktop**, el click
  navega directo a la opción más representativa (`F1 ACTUAL` → `/standings`,
  `TUTORIALES` → `/how-to-play`) usando `useNavigate`; el `hover` sigue
  abriendo el mega menú igual que antes. En **mobile** no se tocó nada: el
  click sigue solo abriendo/cerrando el acordeón.

## 2026-09-28 · Arreglar confeti congelado del podio y `confirmDialog` que rechazaba al cancelar

- **Confeti congelado (`Confetti.jsx`)**: en producción, el confeti del
  podio a veces dejaba de aparecer y no volvía ni refrescando — solo un
  remount (ej. buscar y borrar en Ranking) lo hacía volver. Confirmado con
  DevTools en vivo: las piezas quedaban con `top: '110%', opacity: '0'`
  fijo entre dos lecturas separadas por 1s, es decir, la animación
  `repeat: Infinity` corrió una vez y no volvió a repetir — comportamiento
  conocido de Chrome con animaciones de `top` (layout) en pestañas que
  estuvieron en segundo plano. Se cambió a animar `y` (`transform`) con
  valores fijos en px (`-24 → 320`) en vez de `top` en porcentaje; se
  documentó la regla general en `diseno.md`.
- **`DialogContext.jsx` (`confirmDialog`)**: al cancelar, la promesa hacía
  `reject(false)` en vez de `resolve(false)`. Los call-sites que hacían
  `const confirmed = await confirmDialog(...); if (!confirmed) return;`
  (Register, Predictions, Circuit/Team/Driver Create-Edit, RaceForm)
  quedaban con una promesa rechazada sin capturar al cancelar. Se cambió a
  `resolve(false)` y se ajustaron los call-sites que dependían del
  `reject` para abortar por `catch` (`Dashboard.jsx` x3, `Assignments.jsx`,
  `NotificationsTab.jsx`) para que ahora chequeen el `confirmed` resuelto
  en vez de depender de la excepción.

## 2026-09-24 · Extender `Reveal` a las tarjetas del calendario

- `Calendar.jsx`: las `article.calendar-item` de ambas columnas
  (`left-col`/`right-col`) ahora usan `Reveal` (delay escalonado por índice
  dentro de cada columna, así las dos tarjetas de una misma fila aparecen
  juntas).

## 2026-09-24 · Animación de aparición al hacer scroll (`Reveal`)

- Nuevo componente genérico `components/Reveal.jsx`: envuelve una sección o
  tarjeta y la anima con fade + `y` al entrar en viewport (`framer-motion`
  `whileInView`, `once: true`), respeta `useReducedMotion()`. Soporta `as`
  como tag string (`"section"`, `"article"`) o como componente con
  forwardRef (ej. `Link` de react-router), memoizado para no remontar el
  subárbol en cada render.
- Aplicado en `Home.jsx`: sección "¿Cómo funciona?", las 3 `info-card`
  (delay escalonado 0/0.1/0.2) y el `split-section` final. El hero queda
  sin animar por estar arriba del pliegue, y la sección de ranking queda
  sin envolver porque el `Podium` ya tiene su propia entrada animada.
- Aplicado en las grillas de tarjetas de `Drivers.jsx`, `Teams.jsx` y
  `Circuits.jsx`, con delay escalonado por índice
  (`Math.min(index * 0.05, 0.4)`).
- No se tocó `Ranking.jsx`/`Standings.jsx` (filas de tabla): sigue vigente
  la pausa de animación de filas acordada en la entrada anterior.

## 2026-09-24 · Sacar animación de filas de las tablas (por ahora)

- Se quita `AnimatePresence`/`motion.tr` de las 7 tablas (`Ranking.jsx`,
  `Standings.jsx` x2, `DriversTable`, `TeamsTable`, `CircuitsTable`,
  `RacesTable`, `UsersTable`); vuelven a ser `<tr>` planos, sin animación al
  filtrar. Después de probar `layout` (rompía, filas de costado) y
  `mode="popLayout"` (rompía distinto, filas a la esquina), el
  desvanecimiento solo tampoco convenció — se pausa la animación hasta
  definir un diseño que funcione bien.
- El podio que se oculta al buscar (`Ranking.jsx`/`Standings.jsx`) no se
  toca, sigue igual.
- Detalle en [diseno.md](./diseno.md).

## 2026-09-23 · Fix: filas que "vuelan" a la esquina al buscar

- Causa real del glitch reportado (filas deslizándose a la esquina superior
  izquierda): `mode="popLayout"` en `AnimatePresence`. Ese modo saca la fila
  saliente con `position: absolute` para que las demás se reacomoden antes de
  que termine de desvanecerse — pero un `<tr>` no admite `position: absolute`
  como layout de tabla válido, así que se desprende de la tabla y queda
  apilado en la esquina. Confirmado con una prueba aislada (React + Framer
  Motion) comparando ambos modos.
- Se saca `mode="popLayout"` de las 7 tablas (quedó solo `AnimatePresence`
  modo por defecto + fade en el `motion.tr`, sin `layout`).
- Detalle en [diseno.md](./diseno.md).

## 2026-09-23 · Ajustes de feedback: animación de filas, podio y filtros

- **Filas de tabla**: se saca la prop `layout` de `motion.tr` en las 7 tablas
  (se veía como si las filas se corrieran de costado al filtrar); queda solo
  el desvanecimiento (`opacity`).
- **Ocultar podio al buscar**: ahora también en `Ranking.jsx` (antes solo en
  `Standings.jsx`), mismo patrón `AnimatePresence`/`motion.div`.
- **Espaciado del podio**: la regla "más pegado a la tabla que al filtro"
  (antes solo en `Standings.jsx`) pasa a ser la regla **base** de
  `.ranking__podium` en `podium.css` — aplica en Home, Ranking y Standings
  por igual.
- **`Standings.jsx`**: el buscador vuelve a quedar pegado al selector de Año
  (mismo grupo, a la izquierda); el toggle Pilotos/Constructores queda solo,
  a la derecha (antes: Buscar pegado a los botones).
- Detalle en [diseno.md](./diseno.md).

## 2026-09-23 · Fix buscador admin, reorden en Campeonato y animación de filas

- **Fix**: el buscador del admin (`Dashboard.jsx`) no llegaba al borde derecho
  — al buscador (`.ranking-input-group`) le faltaba `w-100` para llenar el
  ancho reservado por `.admin-filters-right`. Regresión del cambio anterior
  (al unificar el buscador se perdió el `width:100%` que tenía el viejo
  `.ranking-search`).
- **`Standings.jsx`**: los filtros vuelven a reordenarse — Año queda solo a
  la izquierda; Buscar + los botones Pilotos/Constructores se agrupan a la
  derecha (antes: botones+Año a la izquierda, Buscar a la derecha).
- **Animación de filas al buscar**: toda tabla con buscador en vivo anima sus
  filas al aparecer/desaparecer por el filtro (`framer-motion`,
  `AnimatePresence`+`motion.tr`, fade 0.2s, respeta `prefers-reduced-motion`).
  Aplicado en `Ranking.jsx`, `Standings.jsx` y las 5 tablas del admin.
- Detalle en [diseno.md](./diseno.md).

## 2026-09-23 · Buscador único en todo el proyecto + ajustes en Campeonato

- **Buscador unificado**: se reemplaza el patrón "input + botón celeste
  'Buscar'" (que no hacía nada, porque el filtro ya se aplica al tipear) por
  el mismo componente que ya usaba `Standings.jsx`: `.ranking-input-group`
  con label "Buscar" y un `<input>` sin botón. Se actualizan `Ranking.jsx`,
  `PredictionHistory.jsx` y el buscador del admin (`Dashboard.jsx`); se
  eliminan las clases que quedaron sin uso (`.ranking-search`,
  `.ranking-search__input`, `.ranking-search__button` de `components.css`;
  `.search-bar`, `.btn-search` de `predictionHistory.css`). Nueva regla
  compartida `.ranking-input-group input[type="text"|"search"]` en
  `ranking.css` para que cualquier pantalla pueda usar este buscador sin
  clases propias.
- **`Standings.jsx`** (Campeonato de pilotos/constructores):
  - Los filtros se reordenan: botones Pilotos/Constructores + Año agrupados a
    la izquierda, buscador a la derecha (antes: botones — año — buscador,
    en ese orden, más separados).
  - Más espacio entre los filtros y el podio; menos espacio entre el podio y
    la tabla.
  - Al escribir en el buscador, el podio se oculta con una animación de
    colapso (`framer-motion`) para que la tabla filtrada quede visible sin
    scrollear; reaparece al vaciar el buscador. Respeta
    `prefers-reduced-motion`.
- Detalle en [diseno.md](./diseno.md).

## 2026-09-23 · Orden fijo filtros → podio → tabla

- Se fija un orden único para toda pantalla con podio: filtros/buscador
  arriba de todo, podio en el medio, tabla abajo.
- `Ranking.jsx`: el podio pasa de estar arriba de los filtros a estar debajo
  (mismo bloque de filtros, sin cambios internos).
- `Standings.jsx`: los botones Pilotos/Constructores (antes en su propia fila
  arriba del podio) se unifican dentro de `.standings-filters`, junto al año
  y el buscador, y todo ese bloque pasa a estar arriba del podio.
- Verificado en mobile y desktop (con Bootstrap real) que ninguna fila se
  rompe con el reacomodo.

## 2026-09-22 · Pills de piloto en constructores: trigrama y puntos destacados

- La columna "Pilotos" de constructores muestra el **trigrama** de cada
  piloto (antes el nombre completo), con el nombre completo como `title`
  (tooltip). El backend suma `trigram` a `findConstructorsStandings`.
- Los puntos de cada piloto se destacan en rojo (`--color-red`, texto suelto
  sin fondo/cápsula — primer intento con un chip de fondo se descartó por
  pedido explícito de no encerrarlos en un círculo/tag).

## 2026-09-21 · Mismo orden de columnas en pilotos y constructores

- Ambas tablas de `/standings` arrancan igual: Posición · Piloto/Escudería ·
  Puntos totales, y después el resto de columnas propias de cada una
  (Nacionalidad/Equipo Actual en pilotos; Pilotos en constructores). Antes
  "Puntos" iba al final en las dos, y con nombres distintos ("Pos."/"Puntos").

## 2026-09-21 · Tabla de constructores: escuderías en 0 y columna de pilotos

- `findConstructorsStandings` ya no filtra las escuderías con 0 puntos: se
  listan todas.
- Nueva columna **Pilotos** en la tabla: una pill por piloto del plantel
  actual de la escudería (mismo criterio que la tabla de escuderías del
  admin), con sus puntos de la temporada al lado. Estilo `.team-driver-pill`
  en `standings.css`, inspirado en `.admin-status-pill.pill-driver` del panel
  admin pero para la tabla pública.

## 2026-09-21 · Renombrar "Clasificación" a "Campeonato"

- Ítem del mega menú `Nav.jsx`: "CLASIFICACIÓN" → "CAMPEONATO".
- Títulos en `Standings.jsx`: "CLASIFICACIÓN DE PILOTOS" / "CLASIFICACIÓN DE
  CONSTRUCTORES" → "CAMPEONATO DE PILOTOS" / "CAMPEONATO DE CONSTRUCTORES".
  La ruta sigue siendo `/standings`.

## 2026-09-21 · Podio: sin borde en la foto y ajuste de alturas en desktop

- Se quita el borde blanco de `.podium__photo`.
- Primer ajuste: las tarjetas bajan de altura (330/290/280 → 210/240/200 según
  puesto) para acercar el nombre/puntos a la foto.
- Ajuste posterior: ese achique fue demasiado — con subtítulo (escudería,
  Standings) el texto quedaba pisando la foto, y sin subtítulo (Home/Ranking
  global) casi sin aire. Alturas finales 235/275/245 (pos3/pos1/pos2), que dan
  un margen prolijo en ambos casos (verificado con captura de ambos layouts).

## 2026-09-21 · Campeonato de constructores

- Se agrega la clasificación de constructores a `/standings` (toggle
  Pilotos/Constructores). Requirió un cambio de modelo: `Races.results` ahora
  guarda `team` por resultado (la escudería con la que corrió ese piloto esa
  carrera puntual), porque sumar por el equipo *actual* del piloto (como hace
  pilotos) da mal apenas hay un cambio de escudería a mitad de temporada —
  caso real detectado en la base al investigar esto.
- Nuevo `findConstructorsStandings(year)` en `back/services/teams.services.js`
  + endpoint `GET /api/standings/constructors`. `RaceForm.jsx` (vía
  `PredictionsForm.jsx`) suma un selector de escudería por resultado, sugerido
  a partir del equipo actual del piloto y editable.
- **Backfill de las 33 carreras ya cargadas (hecho)**: investigado ronda por
  ronda con fuentes reales (RacingNews365, Sky Sports, F1.com). Solo Hadjar y
  Lawson necesitaban un equipo distinto al "actual" de la base, por un
  reemplazo real de mitad de temporada (lesión de muñeca de Hadjar: Lawson lo
  reemplazó en Red Bull desde el GP de Países Bajos). Script de un solo uso,
  ya descartado tras aplicarse; `unresolvedResults` quedó en 0.
- Detalle completo: [features/clasificacion-pilotos.md](./features/clasificacion-pilotos.md).

## 2026-09-20 · Podio desktop: puntos en el renglón del nombre

- Desktop: bandera · nombre · puntos comparten fila (puntos a la derecha) y la
  escudería queda debajo del nombre. El nombre ahora puede partirse en dos
  líneas (nombre / apellido) en tarjetas angostas; entre 992 y 1199px la
  tipografía baja un poco.

## 2026-09-20 · Podio desktop: bandera a la izquierda del nombre

- Desktop pasa a usar la misma disposición que mobile: bandera a la izquierda
  del nombre y escudería alineada con el nombre; los puntos siguen abajo a la
  derecha. Bandera algo más chica (1.5rem) para no truncar el nombre.

## 2026-09-20 · Podio mobile: bandera a la izquierda del nombre

- En mobile la bandera pasa de estar junto a los puntos a ir a la izquierda del
  nombre (la escudería queda alineada con el nombre); los puntos van solos
  abajo. Desktop sin cambios.

## 2026-09-20 · Podio mobile: foto centrada y puntos a la izquierda

- En mobile los puntos quedaban "en el medio" de la tarjeta (alineados al borde
  de la columna de texto). Ahora la foto se centra verticalmente y los puntos
  van a la izquierda con la bandera al lado. Desktop sin cambios.

## 2026-09-20 · Fix: textos del podio pisados (mobile) y cortados (desktop)

- Mobile: la altura fija de la tarjeta comprimía nombre y escudería hasta
  taparlos cuando había subtítulo. Ahora `min-height` + `.podium__info` como
  grilla (bandera y puntos en la misma fila), sin elementos que se achiquen.
- Desktop: con tarjetas angostas el nombre se truncaba ("GEOR…"). El texto pasa
  a ocupar todo el ancho debajo de la foto y las tarjetas son algo más altas.

## 2026-09-20 · Podio reutilizable en Ranking y Clasificación de pilotos

- El podio del Home se extrae al componente `Podium` (`components/Podium.jsx`,
  estilos movidos de `home.css` a `assets/styles/podium.css`). Recibe `entries`
  genéricas, así sirve para usuarios y pilotos.
- Se agrega en: **Ranking** (modo Global y modo Por Gran Premio — cambia al
  elegir circuito/año), y **Clasificación de pilotos** (top 3 de la temporada
  elegida, con la escudería como subtítulo `.podium__subtitle`).
- `Home.jsx` pasa a usar el componente (sin cambios visuales).

## 2026-09-20 · Título del podio: "PUNTUACIÓN GLOBAL TEMPORADA {año}"

- Reemplaza "TOP 10 - PUNTUACIÓN GLOBAL" en el Home. El año se calcula solo con
  el nuevo helper `getSeasonYear` (`utils/helpers.js`): cambia al año nuevo recién
  cuando empieza su primera carrera, no cuando se cargan las fechas.
  Detalle en [logica.md](./logica.md).

## 2026-09-20 · Título del ranking del Home igual al de "¿Cómo funciona?"

- `.ranking__title` pasa a 24px / peso 400 / sin `letter-spacing` (mismo
  tratamiento que `.how-it-works__text h2`) y, desde 768px, `padding: 0 20px`
  para alinear su borde izquierdo con el texto de "¿Cómo funciona?".

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
