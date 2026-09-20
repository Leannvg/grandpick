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
| `--color-next` | `#D40000` | "Próxima carrera", chips de sesión Race |
| `--color-login` | `#7AB3DE` | Botón login / circuitos |
| `--color-logout` | `#E85F5F` | Botón logout |
| `--color-pos1/2/3` | `#DDBF4A` / `#D8D8D8` / `#D89762` | Podio en tablas (oro/plata/bronce) |
| `--color-stat-qualy/sprint/race` | `#E6E6E6` / `#FFCD56` / `#D40000` | Chips por tipo de sesión |
| `--radius-general` | `2px` | Radio de bordes estándar |

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

| Clase | Rol |
|---|---|
| `.ranking-card` | Contenedor con overflow oculto |
| `.ranking-table-container.table-responsive` | Scroll horizontal + `border-radius` |
| `.ranking-table` | `<table>`: fondo blanco, `box-shadow`, texto centrado 14px |
| `.ranking-table th` | Header azul `#5c8ab3`, texto blanco |
| `.ranking-table td` | Celdas con borde inferior `#f0f0f0`, `vertical-align: middle` |
| `.pos-cell` + `.pos-1` / `.pos-2` / `.pos-3` | Columna de posición; fondo de podio en top 3 |
| `.ranking-input-group` + `.ranking-input-group-text` | Filtros (label gris + `select`/`input` sin borde) |
| `.ranking-empty-state` | Fila de "sin resultados" |
| `.emoji-flag` | Banderas emoji (fuente Twemoji) |
| `.w-50px`, `.w-120px`, `.h-38px` | Utilidades de tamaño ya definidas |
| `.btn-row-action` | Ícono dentro de `.user-info` (junto al nombre): en modo `global` va al historial del usuario (`bi-clock-history`); en modo `grand_prix` abre `FloatingPredictionCompare` (`bi-arrow-left-right`). Círculo sólido azul con ícono blanco (`#4c86b7`, hover `#357abd`) — mismo diseño que el botón circular de confirmar (`.submit-btn`/`SubmitButton`, usado en login/registro/predicciones). |

## Podio (`Podium`, estilos en `assets/styles/podium.css`)

Componente reutilizable `components/Podium.jsx` (ver [componentes.md](./componentes.md)); se usa en Home, Ranking (global y por GP) y Clasificación de pilotos. Clases `.ranking__podium`, `.podium__*`.

Tarjetas estilo F1/F2 (referencia: podios oficiales de f1.com / fiaformula2.com).
Cada `.podium__item` (`--pos1/2/3`) define `--podium-color` (`--color-pos1/2/3`)
y `--podium-height`; fondo en degradé del color del puesto oscurecido con
`--color-dark-blue`, más rayas diagonales de velocidad (`::before`). Contiene
`.podium__photo` (foto de perfil cuadrada con borde blanco y esquinas redondeadas, tamaño `--podium-photo`, arriba a la derecha, alineada con el padding de `.podium__info`; evita pixelado por estirar) y
`.podium__info`: `.podium__rank` (`1º`), `.podium__name` (nombre + **apellido**
en un renglón, con elipsis), `.podium__subtitle` (opcional, ej. escudería del
piloto), `.podium__flag` y `.podium__points` (abajo, grande).

- **Mobile**: tarjetas apiladas en columna, orden 1º · 2º · 3º (`order` CSS).
- **Desktop (≥992px)**: grilla de 3 columnas en orden DOM 2º · 1º · 3º,
  alineadas abajo; el 1º más alto (330px), 2º 290px, 3º 280px. Las tarjetas
  son angostas, así que el texto ocupa todo el ancho **debajo de la foto**
  (nombre y escudería sin truncarse).
- **Mobile**: la foto va centrada verticalmente y la bandera a la izquierda del
  nombre (escudería alineada con el nombre) y los puntos abajo a la izquierda
  (en desktop: foto arriba, bandera abajo a la izquierda y puntos a la derecha).
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

Ejemplo: tarjetas del podio del Home — entrada escalonada (3º → 2º → 1º),
elevación de 6px al hover y animaciones constantes: brillo que barre cada
tarjeta en loop (`.podium__shine`) y confeti cayendo en las tres (`Confetti`), con la misma paleta en las tres (el podio se comparte) pero distinto ritmo y forma: 1º mixto, 2º círculos lentos, 3º tiras rápidas.

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

**Título "rico" para modales de comparación** (`.gp-compare-title`, usado en
`FloatingPredictionCompare`): en vez de `.gp-modal-title` plano, cuando el
modal enfrenta a dos personas se arma `{nombre A}` — círculo "VS" (fondo
`--color-red`) — `{nombre B}`, con el nombre del GP como subtítulo
(`.gp-compare-subtitle`, mismo tratamiento que `.gp-modal-subtitle` pero
centrado). No introduce colores nuevos: reutiliza `--color-red` (ya usado
como acento/destacado) y `--color-login` para resaltar "Vos".

**Bottom-sheet mobile** (`<1200px`): algunos modales con contenido tabular
denso (ej. `FloatingPredictionCompare`) reemplazan el modal centrado por un
panel que sube desde abajo, replicando el drawer de `PredictionHistory.jsx`
(`.history-drawer-overlay` + `.drawer-handle` de `predictionHistory.css`,
reutilizados tal cual, más `.gp-compare-drawer`/`.gp-compare-drawer-header`/
`.gp-compare-drawer-body` para el contenedor y layout propios): overlay +
tirador arriba + arrastre hacia abajo (`framer-motion`, `drag="y"`,
`onDragEnd` con umbral de 100px) para cerrar. Se cierra por arrastre o
tocando el overlay; sin botón "Cerrar" explícito.

### Tablas del panel admin

Usan otra familia: `.admin-table`, `.admin-table-container`, `.admin-status-pill`,
`.btn-admin-action` (ver `assets/styles/admin.css`). Para vistas públicas se usa
la familia `ranking-*`.

## Navegación (`front/src/components/Nav.jsx`)

- Navbar sticky de Bootstrap. Ítems públicos: HOME, CALENDARIO. Autenticado suma
  PREDECIR, MI HISTORIAL, RANKING.
- **Mega menús** (`renderMegaMenu`): dos dropdowns con submenú a ancho completo:
  - `F1 ACTUAL` → ESCUDERÍAS (`/teams`), PILOTOS (`/drivers`), CIRCUITOS
    (`/circuits`), CLASIFICACIÓN (`/standings`).
  - `TUTORIALES` → CÓMO JUGAR, GUÍA DE F1, F1 TV.
- Cada ítem del mega menú es un `<li className="col-12 col-md-4">` (o `col-md-3`
  cuando el menú tiene 4 ítems) con `<Link className="mega-link">`.
