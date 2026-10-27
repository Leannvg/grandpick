# Sistema de diseño

Base visual: tema oscuro azulado, tipografía `Akshar`, Bootstrap 5 para grilla.

## Tokens (definidos en `front/src/assets/styles/globals.css`, `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--color-body` | `#0C2C40` | Fondo general |
| `--color-accent` | `#3975A2` | Acentos / links |
| `--color-dark-blue` | `#081D2B` | Header, superficies oscuras |
| `--color-container-bg` | `#0A2434` | Contenedores |
| `--color-red` | `#E10600` | Acento rojo genérico (labels, checkbox admin, badge "VS") |
| `--color-next` | `#D40000` | "Próxima carrera", estados "upcoming". `--color-stat-race` apunta a este mismo token (mismo rojo, dos nombres según el contexto del call site) — cambiar el valor acá, no en los dos lugares. |
| `--color-login` | `#7AB3DE` | Botón login. `--color-circuit` apunta a este mismo token (mismo azul, dos nombres). |
| `--color-logout` | `#E85F5F` | Botón logout |
| `--color-error` | `#9D1422` | Formularios inválidos y alertas de error (`.is-invalid`, `.invalid-feedback`, `.global-alert.alert-danger`) |
| `--color-pos1/2/3` | `#DDBF4A` / `#D8D8D8` / `#D89762` | Podio en tablas (oro/plata/bronce) |
| `--color-stat-qualy/sprint/race` | `#E6E6E6` / `#FFCD56` / `#D40000` | Chips por tipo de sesión — usar siempre estos tres, no inventar una paleta nueva para "qualy/sprint/race" en una pantalla nueva (pasó con el chip del Home, ver changelog 2026-10-26). |
| `--radius-general` | `6px` | Radio de bordes estándar. Antes era responsive (2px hasta 992px, 6px en desktop); desde 2026-10-17 queda fijo en 6px en todas las resoluciones (a pedido). **Nota (auditoría 2026-10-26):** en la práctica conviven muchos valores sueltos (8px/4px/12px/10px aparecen más que 6px) — no se migró en esta pasada, queda para una revisión de radios aparte. |

**Revisado en la auditoría de colores (2026-10-26), dejado como está a
propósito:**
- `#e1310c` (rojo de acento del panel admin — tab activo, borde de fila
  "próxima") se usa consistente dentro de `admin.css`, que ya es su propia
  familia documentada más abajo ("Tablas del panel admin"). No es la misma
  inconsistencia que el chip del Home (ahí el problema era un mismo
  concepto con dos paletas en pantallas públicas distintas).
- La paleta de grises tipo Tailwind/slate (`#f8fafc`, `#f1f5f9`, `#e2e8f0`,
  `#cbd5e1`, `#0f172a`, etc.) vive casi toda en `information.css` (páginas
  "Cómo jugar" / "Guía de F1" / "F1 TV"), con fuga leve a `admin.css`. Es un
  sistema visual propio y autocontenido (cards claras sobre fondo oscuro,
  pensado para lectura larga) más que una inconsistencia — unificarlo con
  el resto implicaría rediseñar esas pantallas, no solo cambiar un color.
  Queda anotado, no se tocó.

## Iconos (Bootstrap Icons, CDN en `index.html`)

Se usan como `<i className="bi bi-…">`. Regla global en `globals.css`:
`.bi { line-height: 1; }`, para que la caja del `<i>` no herede el strut del
texto (el `line-height` 1.5 del body dejaba un espacio abajo del glifo y el
ícono parecía descentrado dentro de botones y círculos). Dentro de botones
usar contenedor flex con `align-items: center; justify-content: center`.

## Layout de página estándar

```jsx
<div className="<nombre>-page page-wrapper">
  <section className="page-section container text-center">
    <header className="page-header">
      <p className="section-label">Eyebrow</p>
      <h1 className="section-title">TÍTULO</h1>
      <p className="section-subtitle">Subtítulo</p>
    </header>
    {/* contenido */}
  </section>
</div>
```

## Patrón de tablas (fuente de verdad: `assets/styles/ranking.css`)

Todas las tablas de datos "tipo campeonato" reutilizan estas clases para mantener
armonía. **No crear tablas nuevas desde cero**: reutilizar o extender.

**Corrección (auditoría 2026-10-26):** la nota anterior decía que
`.prediction-comparison-table` (`predictionHistory.css`) era una segunda
familia de tabla duplicando `ranking-*`. Era CSS **muerta** — ninguna clase
de ese bloque (`.prediction-comparison-table`, `.table-header`, `.table-row`,
`.col-pos/pred/real/points`, `.driver-color-bar`, `.driver-name`,
`.no-selection-message`) se aplicaba en ningún `.jsx`; se borró. El
componente real de comparación (`PredictionComparisonTable.jsx`) usa la
familia `cmp-*` de `predictionCompare.css`, que **no** es una tabla "tipo
campeonato" — es una tarjeta oscura con grid para mostrar 10 filas de
piloto-predicho/piloto-real con puntos pegados a cada celda, reutilizada
en el historial y en el modal de comparación entre usuarios; ya usa
`var(--radius-general)` y un `box-shadow` casi idéntico al de
`ranking-table`. Es una familia aparte a propósito (vive sobre fondo oscuro
de modal/panel, no sobre la página clara), no una inconsistencia — no se
tocó. Lo único que sí estaba desalineado era el radio de `ranking-table`
(`12px` hardcodeado en vez del token): pasa a `var(--radius-general)`.

| Clase | Rol |
|---|---|
| `.ranking-card` | Contenedor con overflow oculto |
| `.ranking-table-container.table-responsive` | Scroll horizontal + `border-radius` |
| `.ranking-table` | `<table>`: fondo blanco, `box-shadow`, texto centrado 14px |
| `.ranking-table th` | Header azul `#5c8ab3`, texto blanco |
| `.ranking-table td` | Celdas con borde inferior `#f0f0f0`, `vertical-align: middle` |
| `.pos-cell` + `.pos-1` / `.pos-2` / `.pos-3` | Columna de posición; fondo de podio en top 3 |
| `.ranking-input-group` + `.ranking-input-group-text` | Filtros (label gris + `select`/`input` sin borde). También es el **buscador estándar** de todo el proyecto: label "Buscar" + `<input>` que filtra en vivo con cada tecla — **sin botón** (un botón "Buscar" separado es confuso si el filtro ya se aplica solo). Reemplazó a `.ranking-search`/`.ranking-search__button` y a `.search-bar`/`.btn-search` (eliminadas), que sí tenían un botón sin acción real. Usado en Home/Ranking/Standings, `PredictionHistory.jsx` y el buscador del admin (`Dashboard.jsx`). |
| `.ranking-empty-state` | Fila de "sin resultados" |
| `.emoji-flag` | Banderas emoji (fuente Twemoji) |
| `.w-50px`, `.w-120px`, `.h-38px` | Utilidades de tamaño ya definidas |
| `.btn-row-action` | Ícono dentro de `.user-info` (junto al nombre): en modo `global` va al historial del usuario (`bi-clock-history`); en modo `grand_prix` abre `FloatingPredictionCompare` (`bi-arrow-left-right`). Círculo de **contorno** azul (`#4c86b7`, fondo transparente, hover `rgba(76,134,183,.12)` + `scale(1.1)`) — ver la familia de botón circular con ícono más abajo. |

## Podio (`Podium`, estilos en `assets/styles/podium.css`)

Componente reutilizable `components/Podium.jsx` (ver [componentes.md](./componentes.md)); se usa en Home, Ranking (global y por GP) y Campeonato de pilotos/constructores. Clases `.ranking__podium`, `.podium__*`.

**Orden fijo en toda pantalla con podio**: filtros/buscador → podio → tabla.
Si hay botones de modo (Global/Por Gran Premio en `Ranking.jsx`; Pilotos/
Constructores en `Standings.jsx`), van dentro de la misma fila que los demás
filtros (no sueltos arriba del podio) — mismo patrón de grilla responsive
que ya usa `Ranking.jsx` (columnas `col-12 col-md-auto` con `order`/`order-md`
para reordenar en mobile sin romper). En `Standings.jsx` el buscador va pegado
al selector de Año (mismo grupo, a la izquierda); el toggle Pilotos/
Constructores queda solo, a la derecha.

**Espaciado, siempre el mismo en los tres usos** (regla base en
`.ranking__podium`, `podium.css`, no una excepción por pantalla): el podio
queda más pegado a la tabla de abajo que a los filtros de arriba —
`margin-top: 32px` (48px desktop) / `margin-bottom: 12px` (20px desktop).

**Ocultar el podio al buscar**: en `Ranking.jsx` y `Standings.jsx`, mientras
el buscador tiene texto, el podio se desmonta con `AnimatePresence`/
`motion.div` (colapso de `height` + fade, 0.3s, `overflow: hidden` en el
wrapper para que el margen no se pierda ni colapse con la tabla) — así la
tabla filtrada queda visible sin scrollear de más. Respeta
`useReducedMotion()` (sin animación, solo mostrar/ocultar). `Home.jsx` no
tiene buscador, así que no aplica.

Tarjetas estilo F1/F2 (referencia: podios oficiales de f1.com / fiaformula2.com).
Cada `.podium__item` (`--pos1/2/3`) define `--podium-color` (`--color-pos1/2/3`)
y `--podium-height`; fondo en degradé del color del puesto oscurecido con
`--color-dark-blue`, más rayas diagonales de velocidad (`::before`). Contiene
`.podium__photo` (foto de perfil cuadrada con esquinas redondeadas y sin borde, tamaño `--podium-photo`, arriba a la derecha, alineada con el padding de `.podium__info`; evita pixelado por estirar) y
`.podium__info`: `.podium__rank` (`1º`), `.podium__name` (nombre + **apellido**
en un renglón, con elipsis), `.podium__subtitle` (opcional, ej. escudería del
piloto), `.podium__flag` y `.podium__points` (abajo, grande).

- **Mobile**: tarjetas apiladas en columna, orden 1º · 2º · 3º (`order` CSS).
- **Desktop (≥992px)**: grilla de 3 columnas en orden DOM 2º · 1º · 3º,
  alineadas abajo; el 1º más alto (275px), 2º 245px, 3º 235px. Las tarjetas
  son angostas, así que el texto ocupa todo el ancho **debajo de la foto**
  (nombre y escudería sin truncarse).
- **Mobile**: la foto va centrada verticalmente y la bandera a la izquierda del
  nombre (escudería alineada con el nombre) y los puntos abajo a la izquierda
  (en desktop igual, pero con la foto arriba y los puntos **en el mismo renglón
  que el nombre**, a la derecha; el nombre puede partirse en dos líneas si la
  tarjeta es angosta).
- `.podium__info` es una grilla (posición · nombre · subtítulo · bandera + puntos);
  en mobile la tarjeta usa `min-height` y crece si hace falta, para que nada
  se superponga.

## Animaciones (regla del proyecto)

Toda animación de UI se hace con **`framer-motion`** (`motion.*`, `AnimatePresence`,
`whileInView`, `whileHover`, `drag`), no con keyframes/transiciones CSS nuevas
(las ya existentes, como los skeletons o las flechas del hero, se mantienen).
Pautas: duraciones cortas (0.2–0.5s), `ease: "easeOut"`, entradas con
`opacity` + `y`/`scale`, `viewport={{ once: true }}` para animar al hacer scroll
solo la primera vez, y respetar `useReducedMotion()` (con `initial={false}`).
Los `whileHover` deben definir su propia `transition` para no heredar el `delay`
de la entrada.

**Excepción a la regla de arriba — loops infinitos decorativos
(`repeat: Infinity` / `animation-iteration-count: infinite`): usar CSS
nativo (`@keyframes` + `animation`), no `framer-motion`.** El confeti del
podio (`Confetti.jsx`) usaba `framer-motion` con `repeat: Infinity` y, en
producción, la animación se "congelaba" (dejaba de repetir) sin causa
aislable — no reproducía en ningún harness mínimo, con mount confirmado
limpio (sin re-render, sin remount) por logs. Se probaron y descartaron
como causa: animar `top` en vez de `y`/`transform`, objetos `initial`/
`animate`/`transition` recreados por render (se memoizaron igual, por buena
práctica) y un remount periódico como salvaguarda — ninguno lo resolvió.
La solución fue sacar el loop de `framer-motion` por completo: `Confetti.jsx`
renderiza `<span>` planos con `@keyframes confetti-fall` en `podium.css`
(`animation-iteration-count: infinite`, ángulo de rotación por pieza vía la
variable CSS `--confetti-spin`). El loop lo maneja el motor de renderizado
directamente, no WAAPI orquestado por React — inmune al problema. Sigue
respetando `useReducedMotion()` (no renderiza nada si el usuario pidió
reducir movimiento). Mismo tratamiento para el brillo del podio
(`.podium__shine`): `@keyframes podium-shine` en `podium.css`, con
`animation-delay` distinto por puesto vía la variable CSS `--shine-delay`
(`Podium.jsx`) y la misma duración de ciclo total (4.9s) para los tres, así
quedan sincronizados para siempre y barren en orden 1º → 2º → 3º en cada
vuelta, no solo la primera. Ver el historial completo en
`registro-de-cambios.md` (2026-09-29).

Ejemplo: tarjetas del podio del Home — entrada escalonada (3º → 2º → 1º),
elevación de 6px al hover y animaciones constantes: brillo que barre cada
tarjeta en loop, en orden (1º → 2º → 3º, `.podium__shine`) y confeti
cayendo en las tres (`Confetti`), con la misma paleta en las tres (el podio
se comparte) pero distinto ritmo y forma: 1º mixto, 2º círculos lentos, 3º
tiras rápidas.

**Aparición de contenido al hacer scroll (`Reveal`)**: componente genérico
(`components/Reveal.jsx`, ver [componentes.md](./componentes.md)) que envuelve
una sección o tarjeta y la anima con fade + `y` al entrar en viewport
(`whileInView`, `once: true`). Usado en `Home.jsx` (secciones "¿Cómo
funciona?", las 3 `info-card` con delay escalonado 0/0.1/0.2, y el
`split-section` final — el hero queda afuera por estar arriba del pliegue) y
en las grillas de tarjetas de `Drivers.jsx`, `Teams.jsx`, `Circuits.jsx` y
`Calendar.jsx` (delay escalonado por índice, `Math.min(index * 0.05, 0.4)`
para no demorar demasiado en listas largas). En `Calendar.jsx`, al ser dos
columnas (`left-col`/`right-col`) el índice se reinicia en cada columna, así
las tarjetas de una misma fila (misma ronda visual) revelan juntas. No se
aplicó a `Ranking.jsx`/`Standings.jsx`
(filas de tabla — ver nota debajo) ni al `Podium` (ya tiene su propia
animación de entrada).

**Filas de tabla al filtrar por búsqueda — sin animación (pausado)**: se
probó animar la aparición/desaparición de filas con `AnimatePresence` +
`motion.tr` (`Ranking.jsx`, `Standings.jsx` y las 5 tablas del admin:
`DriversTable`, `TeamsTable`, `CircuitsTable`, `RacesTable`, `UsersTable`).
Se descartaron dos variantes que rompían el layout de la tabla: `layout` en
el `motion.tr` (las filas parecían correrse de costado) y
`mode="popLayout"` en el `AnimatePresence` (saca la fila con
`position: absolute`, que no es válido en un `<tr>` — la fila se desprendía
y quedaba apilada arriba a la izquierda). Con solo desvanecimiento (sin
`layout` ni `popLayout`) tampoco convenció, así que por ahora **las filas se
filtran sin animación** (`<tr>` plano) en las 7 tablas — no reintroducir sin
antes acordar el diseño.

## Modales (`gp-modal-*`, definidos en `assets/styles/components.css`)

Patrón base en `FloatingDialog.jsx` (overlay + card animados con `framer-motion`):
`.gp-modal-overlay`, `.gp-modal-card` (max-width 500px), `.gp-modal-title`,
`.gp-modal-subtitle`, `.gp-modal-actions`, `.gp-btn-cancel` / `.gp-btn-confirm`.
Modificador `.gp-modal-card--wide` (max-width 960px) para modales con tablas
anchas (ej. `FloatingPredictionCompare`).

Los 4 modales `Floating*` (`FloatingDialog`, `FloatingEditProfile`,
`FloatingChangePassword`, `FloatingPredictionCompare`) cierran con la tecla
Escape en desktop vía el hook `useEscapeKey(isActive, onEscape)` (ver
[componentes.md](./componentes.md#hooks)).

**Cruz flotante para cerrar** (`.gp-modal-close`, usada en
`FloatingPredictionCompare` desktop): flota semi-afuera de la esquina
superior derecha de la card (offset negativo), sobre el overlay, en vez de
un botón "Cerrar" al pie — pensada para modales con mucho contenido debajo
(tabla larga) donde conviene poder cerrar sin bajar hasta el final. Va
dentro de un envoltorio propio sin `overflow` (`.cmp-modal-wrap` en
`predictionCompare.css`), no directo en `.gp-modal-card`, porque esa clase
tiene `overflow-y: auto` para scrollear contenido largo y recortaría la
cruz al estar parcialmente afuera de la card. Ningún otro modal del sitio
la usa todavía (los demás cierran con un botón de texto al pie); queda
disponible para sumarla ahí si se decide más adelante.

**Card de GP** (`.cmp-gp-card`, usada en `FloatingPredictionCompare` en vez
del título "VS" anterior, en `assets/styles/predictionCompare.css`): mismo
criterio visual que `.cal-card__row` del calendario (bandera + nombre del
GP + circuito a la izquierda, fecha a la derecha), pero con fondo oscuro
translúcido (`rgba(255,255,255,.045)`, igual que el resto de las tarjetas
del modal) en vez del blanco de `.cal-card__row` real — ese fondo claro
tiene sentido en el calendario, que vive sobre la página, pero no adentro
de este modal oscuro. Sin el riel de ronda ni el botón de horarios de
`CalendarCard`, que acá no aplican.

**Bottom-sheet mobile** (`<1200px`): algunos modales con contenido tabular
denso (ej. `FloatingPredictionCompare`) reemplazan el modal centrado por un
panel que sube desde abajo, replicando el drawer de `PredictionHistory.jsx`
(`.history-drawer-overlay` + `.drawer-handle` de `predictionHistory.css`,
reutilizados tal cual, más `.gp-compare-drawer`/`.gp-compare-drawer-header`/
`.gp-compare-drawer-body` para el contenedor y layout propios): overlay +
tirador arriba + arrastre hacia abajo (gesto manual con eventos de puntero,
no `framer-motion`, ver `useModalPhase` en [componentes.md](./componentes.md#hooks))
para cerrar. Se cierra por arrastre o tocando el overlay; sin botón ni cruz
de cerrar explícita (la cruz flotante de desktop no aplica acá).

**Cuándo usar bottom-sheet vs. modal centrado (`FloatingDialog`)**: la pauta
no es "mobile = bottom-sheet", es la **densidad del contenido**.

- **Modal centrado** (`.gp-modal-card`, `FloatingDialog`/`FloatingEditProfile`/
  `FloatingChangePassword`): para confirmar una acción o un formulario corto
  (pocos campos, sin tabla). Funciona igual en mobile y desktop, no necesita
  convertirse en drawer.
- **Bottom-sheet** (`PredictionHistory.jsx` a nivel página,
  `FloatingPredictionCompare` a nivel modal): para contenido **tabular o
  denso** que en mobile no entra cómodo en un modal centrado chico — una
  tabla de comparación, una lista con detalle. El patrón ya existe hecho dos
  veces (reutilizar las clases de `predictionHistory.css`, no reinventar un
  tercer drawer con su propio gesto/overlay/tirador).
- Si aparece un tercer caso de "necesito mostrar algo denso en mobile", usar
  una de estas dos family, no crear una nueva. Si ninguna encaja, para antes
  de escribir CSS nueva y charlarlo (actualizar esta sección con el criterio
  que se decida).

### Tablas del panel admin

Usan otra familia: `.admin-table`, `.admin-table-container`, `.admin-status-pill`,
`.btn-admin-action` (ver `assets/styles/admin.css`). Para vistas públicas se usa
la familia `ranking-*`.

## Formularios (`.gp-input-group`, `assets/styles/components.css`)

Patrón usado en Login, Register, ForgotPassword, `PasswordInput`,
`FloatingEditProfile` y formularios de admin: `.gp-input-group-container` >
`.gp-input-group` (label + input en fila) + `.gp-input-label` (cápsula azul,
ancho fijo 160px, texto **centrado**). Los placeholders/valores de los
`<input>` van **alineados a la izquierda** (default del navegador para
`.form-control`, no hace falta CSS extra). Para usar `CountrySelect` dentro
de este patrón: `hideLabel={true}` y el `<label className="gp-input-label">`
se pone afuera, en el `.gp-input-group` (mismo approach que el resto de los
campos).

**Ojo con `react-select` dentro de un contenedor `.text-center`** (como
`.auth-section` en Login/Register): a diferencia de un `<input>` (que tiene
`text-align: start` por defecto en el navegador y no hereda el centrado del
ancestro), los `<div>` que arma `react-select` para el placeholder/valor
(`.react-select__placeholder`, `.react-select__single-value`) **sí heredan**
el `text-align` del contenedor — por eso `CountrySelect` se veía centrado
mientras los `<input>` de al lado quedaban a la izquierda. Fix: `text-align:
left` en `.react-select__value-container` (`components.css`), que cubre
placeholder/valor/input por herencia.

`.submit-btn` (botón circular de confirmar, ver también `.btn-row-action`)
soporta `disabled` (`opacity: 0.6; cursor: not-allowed`) — usarlo mientras un
submit async está en curso (ver `Register.jsx`) para evitar doble envío, en
vez de agregar un loader de pantalla completa (`LoaderCar` es para cargas de
datos en página, no para acciones de auth de un solo request).

## Botón circular con ícono (familia, antes no estaba escrita como regla)

Mismo azul (`#4c86b7`) y la misma forma (círculo) en los tres usos; lo que
cambia es **relleno sólido vs. contorno, según el fondo de abajo**:

- **Relleno sólido, ícono blanco** cuando el botón vive sobre un fondo
  oscuro/de color (`--color-body`, paneles, etc.): `.submit-btn` (56px,
  confirmar formularios de auth/predicción) y `.cal-session__predict-btn`
  (28px, "ver mi predicción" en el panel oscuro del calendario).
- **Contorno, fondo transparente** cuando el botón vive sobre una fila
  **blanca** (una tabla `ranking-table`, por ejemplo): `.btn-row-action`
  (28px). Un relleno sólido ahí compite visualmente con el texto negro de la
  fila — por eso es la única excepción deliberada, no un descuido.
- 28px es el tamaño para acciones secundarias/dentro de una fila; 56px para
  la acción primaria de una pantalla (hay una sola por página). No inventar
  un tercer tamaño o un tono de azul distinto para un botón circular nuevo:
  sumarlo a esta familia.
- Hover: el contorno aclara el relleno (`rgba(76,134,183,.12)`) y escala
  (`scale(1.1)`); el relleno sólido aclara con `filter: brightness(1.12)` y
  escala un poco menos (`scale(1.08)`, el salto se nota más con más masa de
  color). Ninguno usa el azul `#357abd` (estaba documentado acá por error,
  no existe en ningún CSS real).
- No confundir con un **badge de estado** (ej. `.cal-session__status-badge`,
  el check verde de "sesión finalizada" en el calendario): mismo tamaño/forma
  de círculo por prolijidad visual, pero no es clickeable ni es parte de
  esta familia — es información, no una acción.

## Navegación (`front/src/components/Nav.jsx`)

- Navbar sticky de Bootstrap. Ítems públicos: HOME, CALENDARIO. Autenticado suma
  PREDECIR, MI HISTORIAL, RANKING.
- **Mega menús** (`renderMegaMenu`): dos dropdowns con submenú a ancho completo:
  - `F1 ACTUAL` → ESCUDERÍAS (`/teams`), PILOTOS (`/drivers`), CIRCUITOS
    (`/circuits`), CAMPEONATO (`/standings`).
  - `TUTORIALES` → CÓMO JUGAR, GUÍA DE F1, F1 TV.
- Cada ítem del mega menú es un `<li className="col-12 col-md-4">` (o `col-md-3`
  cuando el menú tiene 4 ítems) con `<Link className="mega-link">`.
- Botones padre `F1 ACTUAL` / `TUTORIALES`: en **desktop** el `hover` abre el
  mega menú (sin cambios) y el **click navega directo** a la opción más
  representativa del submenú (`F1 ACTUAL` → `/standings`, `TUTORIALES` →
  `/how-to-play`) usando `useNavigate`. En **mobile** el click sigue solo
  abriendo/cerrando el acordeón (`isMobile.current`), sin navegación nueva.
