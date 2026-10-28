// Bitácora manual de la limpieza de consistencia visual (botones, colores,
// tablas, espaciados, etc.) — no reemplaza rules/registro-de-cambios.md
// (que registra TODOS los cambios del proyecto), es un resumen corto
// enfocado en esta cruzada puntual, para que Leandro y Julieta tengan el
// mismo contexto sin tener que leer el changelog completo.
//
// Regla (ver CLAUDE.md): cada cambio de diseño/consistencia visual suma acá
// una entrada nueva, arriba de todo (orden cronológico inverso). Entrada
// corta: fecha, título, 2-3 líneas de qué cambió y por qué.
export const DESIGN_CHANGELOG = [
  {
    date: "2026-10-28",
    title: "Prolijidad: solo titulares en listados de escudería/pilotos",
    summary:
      "Teams.jsx (público) y TeamsTable.jsx (admin) mostraban todos los pilotos activos de cada equipo, suplentes incluidos; ahora solo titulares (role === \"titular\"). Cards de Teams.jsx más compactas. TeamsTable usa trigrama en vez de nombre completo y suma un acento con el color de la escudería. Asignaciones pierde la columna \"Escudería actual\" de texto plano (quedaba repetida con el select de al lado, que pasa a llamarse así).",
  },
  {
    date: "2026-10-26 / 27",
    title: "Tablas: CSS muerta limpiada + radio de ranking-table unificado",
    summary:
      "La \"segunda familia de tabla\" que parecía existir (.prediction-comparison-table) resultó ser CSS sin un solo uso real — se borró. La familia real de comparación (cmp-*) ya era una familia aparte a propósito (vive en modales/paneles oscuros), no una inconsistencia. Lo único desalineado era el radio de ranking-table (12px hardcodeado en vez del token compartido) — corregido.",
  },
  {
    date: "2026-10-26",
    title: "Colores: tokens duplicados fusionados + chip de sesión del Home conectado",
    summary:
      "--color-circuit/--color-login y --color-stat-race/--color-next eran pares de tokens con el mismo valor exacto y nombres distintos — ahora cada par apunta a un solo valor fuente. El chip \"QUALIFYING/SPRINT/RACE\" del Home tenía CSS para colorearlo pero nunca estaba conectado al componente real (y era otra paleta sin relación con el resto del sitio) — se conectó a los mismos tokens que usa el calendario/historial.",
  },
  {
    date: "2026-10-26",
    title: "Botones circulares unificados + limpieza de CSS muerta",
    summary:
      "El botón \"ver mi predicción\" del calendario no compartía color con el resto de los botones circulares del sitio (.submit-btn, .btn-row-action) — ahora sí. De paso se borraron 7 clases de botón sin un solo uso real en ningún .jsx (.btn-general, .btn-add, .btn-confirm, .btn-delete, .btn-edit, .gp-btn-submit, .close-schedule-btn), que quedaban como trampa para que alguien las copiara pensando que eran la convención vigente.",
  },
  {
    date: "2026-10-26",
    title: "Nace el laboratorio de diseño (esta herramienta)",
    summary:
      "front/lab.html — catálogo visual local para encontrar este tipo de inconsistencias de un vistazo, antes de que se multipliquen. Arrancó la auditoría completa que dio lugar a todo lo de arriba.",
  },
  {
    date: "2026-10-24 / 25",
    title: "Calendario: fila completa clickeable, flecha en vez de reloj",
    summary:
      "Un usuario no identificaba el reloj como botón y tocaba la fecha sin efecto — ahora toda la fila abre/cierra el panel. El ícono pasa de reloj a flecha (con toda la fila clickeable el reloj se leía como decoración). Se agregó la marca de sesión finalizada y el botón \"ver mi predicción\", con pills de duración de ancho fijo.",
  },
];
