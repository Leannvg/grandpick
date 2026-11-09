# Banner de próxima carrera con foto por GP

**Estado: implementado.** Reemplaza a `NextRaceCTA.jsx` **en Home y en
Predicciones** (`front/src/App.jsx`: `isHome ? <GpHeroBanner /> : isPredictions
? <GpHeroBanner variant="predictions" userId={userId} /> : <NextRaceCTA />`).
En el resto de páginas del sitio, `NextRaceCTA.jsx` sigue renderizándose sin
ningún cambio. Diseñado y probado primero en el laboratorio
(`front/src/lab/sections/GpHeroPrototype.jsx`, con datos mock, a lo largo de
varias rondas de feedback — ver `rules/registro-de-cambios.md` para el
historial) antes de portarlo acá; ese prototipo se deja como está, no se
borra.

## variant="predictions"

`GpHeroBanner` acepta `variant` (`"home"` default | `"predictions"`) y
`userId` (solo lo usa `"predictions"`). El topbar (país/fecha/tag/countdown/
horarios) y la foto/fallback son los MISMOS para las dos variantes, sin
tocar — solo cambia `.gp-hero-banner__content`:

- **home**: eyebrow + título + CTA ("Predecir ahora"/"En curso") + "Ver
  circuito" (como siempre).
- **predictions**: título (`<h1>`, reemplaza el `<h1 className="section-title">`
  que tenía Predictions.jsx) y, debajo, UNO de dos bloques según
  `status.isPreWindow`:
  - **pre-ventana**: `.gp-hero-banner__prewindow` — cartel fijo (sin
    contador en vivo), "Las predicciones para {la clasificación/el
    sprint/la carrera} se habilitarán 24 hs antes de su inicio" +
    aviso de que se manda una notificación push cuando se abren (la
    automatización ya existe de verdad, `back/services/pushAutomation.services.js`,
    "🔮 Predicciones habilitadas" — el texto no promete algo sin
    implementar). Pedido: "el cartel de las predicciones se habilitarán
    en X tiempo aparece por debajo del banner, todos los mensajes
    deberían aparecer junto al título... quizás no hace falta poner un
    temporizador".
  - **resto de estados**: countdown "tiempo restante para predecir"
    (mismas cajas `.nr-cta__time` agrandadas, oculto con la carrera
    Finalizado) + `.prediction-status-banner` real
    (`status-saved`/`status-missing`, según `hasPrediction`).

`GpHeroBanner` sigue siendo autónomo (se fetchea su propia carrera vía
`useNextRace()`, igual en las dos variantes) — en vez de recibir la carrera
de Predictions.jsx por prop, lo único que pide aparte (solo en
`variant="predictions"`) es `predictionsServices.findPredictionByUserAndRace(userId, race._id)`
para saber si el usuario ya predijo (booleano `hasPrediction`, no el
contenido completo — Predictions.jsx sigue haciendo su propio fetch
completo para precargar el formulario). Es una carrera "duplicada" respecto
a la que ya pide Predictions.jsx, igual que ya pasaba con `NextRaceCTA`/
`GpHeroBanner` de Home — arquitectura consistente, no se intentó compartir
un único fetch entre banner y página.

Predictions.jsx perdió su `<header>` (país/título/fecha/tag/countdown/
status, todo lo cubre el banner de arriba ahora) y quedó con:
`.gp-hero-banner__predict-below` (franja de transición, mismo CSS que probó
el laboratorio, ahora en `predictions.css`) envolviendo
`.prediction-cards-container`, y el mensaje de "predicciones cerradas".
`CountdownToRace` y `CountdownToOpen` se mantienen montados pero ocultos
(`display:none`) SOLO por sus efectos secundarios (`handleStartRace`/
`onOpen`, respectivamente — arrancan sin esperar un refetch ni un evento de
socket): el cartel visible de "predicciones se habilitarán en..." que tenía
`CountdownToOpen` ya no se muestra ahí, lo reemplazó el cartel fijo del
banner (`.gp-hero-banner__prewindow`, ver más arriba); el countdown visible
"tiempo restante para predecir" de `CountdownToRace` tampoco se muestra,
sigue reemplazado por el del banner.

`.main-content` pasa de la clase `.home-content` a `.hero-banner-content`
(renombrada, ya no es exclusiva de Home) para sacar el margen superior de
40px en cualquier página que empiece con este banner full-bleed.

## Componentes y archivos

- **`front/src/components/GpHeroBanner.jsx`** — el banner en sí. Usa:
  - `useNextRace()` (`front/src/hooks/useNextRace.js`, nuevo) — carrera
    actual/próxima + countdown + nombre de país, extraído de
    `NextRaceCTA.jsx` para que ambos lo reusen sin duplicar fetch/socket.
    `NextRaceCTA.jsx` también pasa a consumir este hook (mismo
    comportamiento, sin cambios visibles).
  - `getImageUrl(race.circuit?.banner_img, 1600)`
    (`front/src/utils/cloudinary.js`, ya existente) — si `banner_img` es
    `null`, se renderiza el fallback degradado (`gp-hero-banner--fallback`).
  - `buildSchedule`/`formatSessionTime` (`front/src/utils/schedule.js`,
    nuevo) — extraído de `CalendarCard.jsx` para no duplicar la lógica de
    agrupar sesiones. `CalendarCard.jsx` pasa a importarlas desde ahí.
  - `practiceSessionsServices.findAll({ circuitId })` — las prácticas no
    vienen en `findCurrentOrNext()`, se piden aparte filtradas por circuito
    (el servicio ya soportaba ese filtro server-side).
- **`front/src/assets/styles/gpHeroBanner.css`** — mismo CSS que
  `front/src/lab/sections/gpHero.css` del prototipo, prefijo renombrado de
  `gp-hero-proto` a `gp-hero-banner`.

## Modelo de datos

- **`Circuits.banner_img`** (`back/schemas/schemas.js`): opcional
  (`yup.string().nullable().optional()`), a diferencia de `img` (mapa de
  pista, sigue requerido). Mismo patrón que `logo`/`isologo` de `Teams`:
  `back/api/routes/circuits.api.routes.js` pasó de
  `multerControl.single("image")` a
  `multerControl.fields([{name:"image"},{name:"banner_img"}])` en POST y
  PATCH; `back/middleware/mapImageToBody.middleware.js` suma el mapeo de
  `req.files.image`/`req.files.banner_img`; `back/api/controllers/circuits.api.controllers.js`
  resuelve ambas imágenes con el helper `resolveImage` ya existente
  (`banner_img` con `defaultImage: null` en vez del `circuit_default.png`
  de `img`).
- **Panel admin** (`front/src/components/dashboardForms/CircuitForm.jsx` +
  `CircuitCreate.jsx`/`CircuitEdit.jsx`): segundo campo de carga "Banner
  (opcional)", mismo patrón que el de "Imagen" (preview + input de
  archivo), campo de FormData `banner_img`.

## Mapeo de datos (todo real, nada mock)

| Dato                 | Fuente                                                             |
|----------------------|---------------------------------------------------------------------|
| foto                 | `race.circuit.banner_img` vía `getImageUrl`                         |
| bandera               | `getFlagEmoji(race.circuit.country)`                                |
| país                  | `countryName` (de `useNextRace()`)                                   |
| fecha                 | `formatRaceDate(race.date_gp_start, race.date_gp_end, race.circuit.timezone)` |
| título                | `race.circuit.gp_name`                                               |
| ronda                 | `race.points_system.type`                                            |
| en curso              | `status.isInProgress` (de `useNextRace()`, via `computeRaceState`)    |
| horarios              | `buildSchedule(sessions, practices)`                                 |

El CTA principal ("Predecir ahora") se reemplaza por una marca no
clickeable "En curso" cuando `status.isInProgress` es true — mismo criterio
que `NextRaceCTA.jsx`, que deja de renderizar ese link cuando `canPredict`
es false. Nota: solo se contempla `isInProgress`; `canPredict` también es
false en pre-ventana (>24hs) y carrera finalizada — en esos casos el CTA
hoy sigue mostrando "Predecir ahora" igual (no se agregó un tercer estado,
no estaba pedido). Si hace falta, queda para una siguiente vuelta.

## Qué queda pendiente

- **Subir las fotos de muestra**: las carga el usuario a mano desde el
  panel admin (Australia, Brasil, Las Vegas, Qatar, Yas Marina — son las
  que ya se usaron para probar el diseño en el laboratorio,
  `front/src/lab/assets/*.jpg`). No se automatizó por decisión explícita
  (evitar que un script le escriba directo a la base de producción).
