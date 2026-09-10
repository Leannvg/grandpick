# Sistema de diseño

Base visual: tema oscuro azulado, tipografía `Akshar`, Bootstrap 5 para grilla.

## Tokens (definidos en `front/src/assets/styles/globals.css`, `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--color-body` | `#0C2C40` | Fondo general |
| `--color-accent` | `#3975A2` | Acentos / links |
| `--color-dark-blue` | `#081D2B` | Header, superficies oscuras |
| `--color-container-bg` | `#0A2434` | Contenedores |
| `--color-red` / `--color-next` | `#D40000` | Destacados, "próxima carrera", labels |
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
