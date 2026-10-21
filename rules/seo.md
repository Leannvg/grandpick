# SEO y posicionamiento web · GrandPick

Documento vivo mantenido por el agente `seo-auditor`
(`.claude/agents/seo-auditor.md`). A diferencia de `rules/seguridad.md`,
nada acá es sensible — se puede compartir sin problema.

Contexto técnico clave: GrandPick es una **SPA pura** (React + React
Router, sin SSR ni pre-renderizado), compilada con Vite y desplegada en
Vercel (front) / Railway (API). Eso condiciona casi todos los hallazgos:
el HTML que se manda al navegador (y a los crawlers) es casi vacío
(`<div id="root"></div>`) hasta que el JavaScript corre y React dibuja la
página.

Cada hallazgo tiene dos ejes para priorizar:

- **Impacto**: Alto / Medio / Bajo.
- **Esfuerzo**: Bajo / Medio / Alto.

Última auditoría: **2026-10-21**.

## Resumen ejecutivo

La mayoría de los problemas importantes son **impacto alto, esfuerzo
bajo** — nunca se tocó el proyecto pensando en SEO, así que hay varios
"quick wins" antes de pensar en algo más grande como pre-renderizado.

| Impacto | Esfuerzo | Cantidad |
|---|---|---|
| Alto | Bajo | 4 |
| Alto | Medio/Alto | 2 |
| Medio | Bajo/Medio | 4 |
| Bajo | Bajo | 2 |

## Quick wins (impacto alto, esfuerzo bajo) — hacer primero

### 1. No hay `<meta name="description">`, ni Open Graph, ni Twitter Card

`front/index.html` solo tiene `<title>GRANDPICK</title>`, sin meta
description. No hay `og:title`, `og:description`, `og:image`,
`twitter:card`, etc.

- **Por qué importa**: sin meta description, Google inventa el snippet
  del resultado de búsqueda (a veces queda feo o irrelevante). Sin Open
  Graph, cuando alguien comparte un link de GrandPick en WhatsApp,
  Twitter/X, Discord o Facebook, no aparece preview (ni imagen, ni texto)
  — para una app que depende de tráfico/boca en boca para crecer, esto es
  una pérdida directa de conversión en el canal más barato que existe
  (compartir links).
- **Qué hacer**: agregar al `<head>` de `index.html` una meta description
  genérica del sitio + el set completo de Open Graph/Twitter con una
  imagen representativa (ej. el logo/ícono `GP-512x512.png` que ya existe
  en `front/public/icons/`). Es estático (sirve igual en todas las rutas)
  pero ya es mucho mejor que nada.

### 2. No existe `robots.txt`

No hay `front/public/robots.txt`. Sin él, los crawlers no tienen ninguna
instrucción: por default intentan rastrear todo, incluyendo rutas que no
tiene sentido indexar (`/login`, `/register`, `/reset-password`,
`/forgot-password`, `/admin/*`).

- **Qué hacer**: crear `front/public/robots.txt` permitiendo el
  rastreo general y bloqueando explícitamente `/admin/`, `/login`,
  `/register`, `/reset-password`, `/forgot-password`, y declarando la
  ubicación del `sitemap.xml` (ver siguiente punto).

### 3. No existe `sitemap.xml`

Sin sitemap, Google tiene que descubrir las páginas solo siguiendo links
internos — más lento y menos confiable.

- **Qué hacer**: `front/public/sitemap.xml` estático con las rutas
  públicas y útiles para indexar: `/`, `/drivers`, `/circuits`, `/teams`,
  `/calendar`, `/standings`, `/how-to-play`, `/f1-tv`, `/f1-guide`. No
  incluir `/ranking` salvo que se decida que vale la pena como contenido
  público (hoy depende de datos en vivo del usuario). Las páginas de
  detalle (`/circuits/:id`, `/teams/:id`) se podrían listar también si no
  cambian de URL con el tiempo.

### 4. Dominio canónico no está resuelto (3 dominios activos)

`back/express.js` permite `grandpick.app`, `www.grandpick.app` y
`grandpick.vercel.app` como orígenes válidos — si los tres (o al menos dos)
sirven el mismo contenido sin que uno redirija al otro, Google puede
tratarlos como contenido duplicado y repartir el "peso" de ranking entre
ellos en vez de concentrarlo en uno solo.

- **Qué hacer**: elegir un dominio canónico (lo lógico: `grandpick.app`),
  configurar en Vercel que `www.grandpick.app` y `grandpick.vercel.app`
  redirijan (301) a ese dominio, y agregar `<link rel="canonical"
  href="https://grandpick.app/...">` por página (esto último ya necesita
  meta tags dinámicos, ver hallazgo #5).

## Impacto alto, esfuerzo medio/alto

### 5. Metadatos estáticos: todas las páginas públicas comparten el mismo `<title>`

Al ser SPA sin gestión de `<head>` por ruta (no hay `react-helmet` ni
similar en `front/package.json`), **todas** las páginas —Home, Pilotos,
Circuitos, Equipos, Calendario, Standings, Cómo Jugar, etc.— muestran el
mismo `<title>GRANDPICK</title>` en la pestaña del navegador y en Google.
Para Google, el título de la página es una de las señales más fuertes de
qué trata esa URL — hoy esa señal es idéntica en todo el sitio.

- **Qué hacer**: sumar una librería liviana de manejo de `<head>` (ej.
  `react-helmet-async`) y definir un `<title>`/`<meta description>`
  específico por página pública (ej. `/circuits/:id` → "Circuito de
  Mónaco | Calendario F1 2026 — GrandPick"). Esfuerzo medio: toca varias
  páginas, pero no es riesgoso.

### 6. Contenido invisible para crawlers que no ejecutan JavaScript

Al no haber SSR ni pre-renderizado, el HTML inicial es casi vacío. Google
generalmente puede renderizar JS (con demora), pero otros buscadores y la
mayoría de los bots que generan previews de links **no ejecutan
JavaScript** — ven el `<div id="root"></div>` vacío.

- **Qué hacer** (más grande, no urgente todavía): evaluar
  pre-renderizado estático de las páginas públicas de contenido fijo
  (`/drivers`, `/circuits`, `/teams`, `/how-to-play`, `/f1-tv`,
  `/f1-guide`) con una herramienta tipo `vite-plugin-ssg` o generando HTML
  estático en build time para esas rutas puntuales, sin migrar todo el
  proyecto a un framework SSR. Dejarlo para cuando los quick wins de
  arriba ya estén implementados y se quiera ir por más tráfico orgánico.

## Impacto medio

### 7. Todo el bundle de JS se carga de una sola vez (sin code-splitting por ruta)

`front/src/App.jsx` importa **todas** las páginas de forma estática al
principio del archivo, incluidas las de admin (`Dashboard`, `TeamCreate`,
`DriverEdit`, `RaceEdit`, etc.) y las de login/registro. No hay ningún
`React.lazy`/`Suspense` en el router. Esto manda un bundle de JS más
pesado de lo necesario incluso a un visitante anónimo que solo abre la
home — afecta directamente el tiempo de carga inicial (Largest
Contentful Paint), que es señal de ranking (Core Web Vitals) además de
afectar la tasa de rebote.

- **Qué hacer**: `React.lazy(() => import('./pages/admin/Dashboard'))` +
  `<Suspense>` al menos para todo lo que está bajo `/admin/*` y las
  páginas de creación/edición (admin-only, nunca las ve un visitante
  anónimo ni la mayoría de los usuarios). Esfuerzo medio, impacto real en
  el bundle inicial.

### 8. Recursos externos en el `<head>` sin `defer`/`async`

`index.html` carga, antes de pintar nada: 2 preconnects, una fuente de
Google Fonts, el CSS completo de Bootstrap desde CDN, los íconos de
Bootstrap, y una `@font-face` extra para banderas — y al final del
`<body>`, el JS de Bootstrap sin `defer`. Son varias requests
render-blocking en serie.

- **Qué hacer**: agregar `defer` al script de Bootstrap, evaluar si se
  usa lo suficiente del JS de Bootstrap como para justificar cargarlo
  entero (vs. los componentes puntuales que ya se usan vía React), y
  revisar si hace falta cargar el CSS completo de Bootstrap o si se puede
  recortar.

### 9. Sin datos estructurados (schema.org)

No hay JSON-LD en ninguna página. Bajo esfuerzo, impacto moderado: por
ejemplo `FAQPage` en `/how-to-play`/`/f1-guide` puede generar "rich
snippets" en Google (preguntas desplegables en el resultado de búsqueda).

### 10. Verificar `alt` en imágenes

No se auditó archivo por archivo, pero vale revisar que las fotos de
piloto, logos de equipo y banderas de país tengan `alt` descriptivo (no
vacío ni genérico) — ayuda a accesibilidad y a Google Images.

## Impacto bajo

### 11. Favicons/manifest ya están bien resueltos (no es un hallazgo, es un control)

Ver sección siguiente.

### 12. Un solo `<h1>` por página — no verificado

Revisar cuando se audite contenido página por página (parte del trabajo
del hallazgo #5).

## Controles ya existentes (lo que está bien)

- `<html lang="es">` correcto en `index.html` — señal de idioma clara
  para buscadores.
- Favicons en múltiples tamaños + `manifest.json` (PWA-friendly) — ya
  resuelto, no tocar.
- `front/vercel.json` con el rewrite `/(.*) → /` — necesario para que las
  rutas de React Router no den 404 al entrar directo a una URL interna
  (ej. compartir un link a `/circuits/5`); ya está bien configurado.
- HTTPS por defecto (Vercel + Railway) — correcto.
- URLs limpias y descriptivas ya desde el diseño de rutas (`/circuits/:id`,
  `/teams/:id`, sin query strings raros) — buena base para cuando se
  agreguen meta tags por página.
- Diseño responsive/mobile-first ya trabajado extensamente en el proyecto
  (ver `rules/diseno.md`) — relevante porque mobile-friendliness es señal
  de ranking, y ya está cubierto.

## Checklist de pendientes (por prioridad)

| Ítem | Impacto | Esfuerzo | Estado |
|---|---|---|---|
| Meta description + Open Graph/Twitter Card (estático) | Alto | Bajo | Pendiente |
| `robots.txt` | Alto | Bajo | Pendiente |
| `sitemap.xml` | Alto | Bajo | Pendiente |
| Resolver dominio canónico (redirect www/vercel.app → grandpick.app) | Alto | Bajo | Pendiente |
| `<title>`/meta description por página (react-helmet-async) | Alto | Medio | Pendiente |
| Code-splitting de rutas admin (`React.lazy`) | Medio | Medio | Pendiente |
| `defer` en script de Bootstrap / revisar peso de CSS externo | Medio | Bajo | Pendiente |
| Datos estructurados (`FAQPage` en guías) | Medio | Bajo | Pendiente |
| Auditar `alt` de imágenes | Medio | Bajo | Pendiente |
| Evaluar pre-renderizado de páginas públicas de contenido fijo | Alto | Alto | A futuro |

## Historial de auditorías

- **2026-10-21** — primera auditoría completa del front (meta tags,
  descubribilidad, dominio canónico, rendimiento/bundle). Realizada por el
  agente `seo-auditor`. No se modificó código, solo se documentó.
