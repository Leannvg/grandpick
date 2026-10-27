// Mismos tokens documentados en rules/diseno.md (definidos en
// assets/styles/globals.css, :root). Si cambian ahí, actualizar acá también.
export const COLOR_TOKENS = [
  { name: "--color-body", value: "#0C2C40", use: "Fondo general" },
  { name: "--color-accent", value: "#3975A2", use: "Acentos / links" },
  { name: "--color-dark-blue", value: "#081D2B", use: "Header, superficies oscuras" },
  { name: "--color-container-bg", value: "#0A2434", use: "Contenedores" },
  { name: "--color-red", value: "#E10600", use: "Acento rojo genérico (labels, checkbox admin, badge VS)" },
  { name: "--color-next", value: "#D40000", use: "Próxima carrera, chips de sesión Race" },
  { name: "--color-login", value: "#7AB3DE", use: "Botón login / circuitos" },
  { name: "--color-logout", value: "#E85F5F", use: "Botón logout" },
  { name: "--color-pos1", value: "#DDBF4A", use: "Podio en tablas — oro (1º)" },
  { name: "--color-pos2", value: "#D8D8D8", use: "Podio en tablas — plata (2º)" },
  { name: "--color-pos3", value: "#D89762", use: "Podio en tablas — bronce (3º)" },
  { name: "--color-stat-qualy", value: "#E6E6E6", use: "Chip de sesión Qualy" },
  { name: "--color-stat-sprint", value: "#FFCD56", use: "Chip de sesión Sprint" },
  { name: "--color-stat-race", value: "#D40000", use: "Chip de sesión Race" },
];

export const OTHER_TOKENS = [
  { name: "--radius-general", value: "6px", use: "Radio de bordes estándar en toda la app (fijo desde 2026-10-17)." },
  { name: "Tipografía", value: "Akshar (Google Fonts, 300–700)", use: "Única familia tipográfica del proyecto." },
  { name: "Grilla", value: "Bootstrap 5", use: "Sistema de columnas/breakpoints." },
];
