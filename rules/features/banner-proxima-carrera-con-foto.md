# Banner de próxima carrera con foto por GP

**Estado: prototipo en laboratorio, no implementado.** Vive solo en
`front/lab.html` (`front/src/lab/sections/GpHeroPrototype.jsx` +
`PrototypesSection.jsx` + `gpHero.css`), con datos 100% mock. No se sube a
producción hasta aprobar el diseño — este documento es el plan técnico para
que, cuando se apruebe, portarlo sea directo y no haya que rediseñar nada.

## Qué resuelve

Reemplaza a `NextRaceCTA.jsx` **solo en Home**: foto de fondo específica del
circuito (en vez del fondo sólido actual), con degradado de legibilidad,
título grande, CTA "Predecir ahora" y el desplegable/bandeja de horarios del
fin de semana. En el resto de páginas del sitio, `NextRaceCTA.jsx` sigue
renderizándose **sin cambios** (es global, vive en `App.jsx`) — este banner
no lo reemplaza ahí, porque no tiene sentido un héroe con foto grande fuera
de Home.

## Modelo de datos que falta

- **Campo nuevo en `Circuits`**: `banner_img` (opcional — a diferencia de
  `img`, que es la imagen del mapa de pista y sigue siendo obligatoria y sin
  tocar). Mismo patrón que ya existe para `logo`/`isologo` en `Teams`
  (`multerControl.fields([...])` en las rutas + `mapImageToBody.middleware.js`
  extendido para mapear `req.files.banner_img`, ver `teams.api.routes.js`
  como referencia exacta).
- **Validación**: `banner_img: yup.string().optional()` en `circuitSchema`
  (`back/schemas/schemas.js`).
- **Fallback obligatorio, no un caso especial**: la mayoría de los circuitos
  no van a tener `banner_img` cargado (recién hay fotos de muestra para 5:
  Australia, Brasil, Las Vegas, Qatar, Yas Marina/Abu Dabi). El laboratorio
  ya prueba y aprueba ese caso — `GpHeroPrototype withPhoto={false}`,
  degradado con `--color-accent`, misma altura que la versión con foto para
  que Home no "salte" al cambiar de GP.

## De dónde sale cada dato (mapeo mock → real)

El prototipo usa una prop `gp` (ver `DEFAULT_GP` en `GpHeroPrototype.jsx`)
que ya está pensada para calzar 1 a 1 con lo que devuelve
`racesServices.findCurrentOrNext()` — el mismo fetch que usa
`NextRaceCTA.jsx` hoy (con su re-fetch en el evento socket
`"races:updated"`, no haría falta duplicar esa lógica):

| Prop `gp` (mock)   | Fuente real                                                        |
|---------------------|---------------------------------------------------------------------|
| `photo`              | `race.circuit.banner_img`                                           |
| `flag`               | `getFlagEmoji(race.circuit.country)` (ya existe, `utils/helpers.js`) |
| `country`             | `countryName` — mismo fetch que ya hace `NextRaceCTA.jsx` vía `countriesServices.getOneCountry` |
| `date`                | `formatRaceDate(race.date_gp_start, race.date_gp_end, race.circuit.timezone)` (ya existe) |
| `title`               | `race.circuit.gp_name` (ya existe en el schema de `Circuits`)        |
| `round.label`/`type`  | `race.points_system.type` — misma normalización que ya hace `NextRaceCTA.jsx` (qualy/sprint/race) |
| `isInProgress`        | `computeRaceState(race).isInProgress` (ya existe, `utils/helpers.js`) |

El CTA principal ("Predecir ahora", bajo el título) ya reacciona a
`isInProgress`: se reemplaza por una marca no clickeable "En curso" (mismo
rojo/punto animado que el tag `EN CURSO` de la barra de arriba), igual que
`NextRaceCTA.jsx` real deja de renderizar el link "Predecir ahora" cuando
`computeRaceState().canPredict` es false. Ojo: en el prototipo solo se
contempla el caso `isInProgress` (el único que hay foto de muestra para
probar, Brasil) — `canPredict` también es false en pre-ventana (>24hs) y
carrera finalizada, casos que la integración real va a tener que cubrir
también (probablemente mismo trato: "En curso" solo si `isInProgress`, y
en los otros dos casos sin canPredict quizás alcance con que "Ver circuito"
quede como única acción, sin la marca roja que es específica de "en vivo").

La solapa de horarios (desplegable desktop / bandeja mobile) ya reusa el
markup y las clases reales de `CalendarCard.jsx` (`.cal-zone`,
`.cal-card__group*`, `.cal-session*`) — falta conectarla con
`buildSchedule`/`formatSessionTime` (mismo archivo) en vez del
`MOCK_SCHEDULE` fijo que tiene hoy el prototipo.

## Fuera de este documento (recién cuando se apruebe el diseño)

- Agregar `banner_img` al backend (schema, rutas, middleware) y al panel
  admin de circuitos (campo de carga de imagen nuevo, junto al de `img`).
- Decidir dónde exactamente se hace el swap en `Home.jsx`/`App.jsx` (hoy
  `NextRaceCTA` es global en `App.jsx`; Home necesitaría no renderizarlo ahí
  y usar este hero en su lugar).
- Conectar `scheduleBody` a datos reales de `race.sessions`/prácticas en vez
  de `MOCK_SCHEDULE`.
- Subir las fotos de muestra (Australia, Brasil, Las Vegas, Qatar, Yas
  Marina) como `banner_img` reales de esos circuitos.
