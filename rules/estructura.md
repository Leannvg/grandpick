# Estructura del proyecto

Monorepo con dos apps independientes más esta carpeta de documentación.

```
GrandPick/
├── back/     API REST (Node + Express + MongoDB nativo)
├── front/    SPA (React + Vite + React Router + Bootstrap 5)
└── rules/    Documentación viva (este directorio)
```

## Backend (`back/`)

Arquitectura por capas. El flujo de una request es:

```
routes/  ->  middleware/  ->  controllers/  ->  services/  ->  MongoDB
```

| Carpeta | Rol |
|---|---|
| `api/routes/*.api.routes.js` | Definición de endpoints y middlewares por ruta. Se montan todos en `/` desde `express.js`. |
| `api/controllers/*.api.controllers.js` | Adaptan req/res. No tienen lógica de negocio pesada; delegan en services. Usan `next(err)` para el `errorHandler`. |
| `services/*.services.js` | Lógica de negocio + acceso a datos. `db.services.js` expone `connectDB()` (singleton de `MongoClient`). |
| `schemas/schemas.js` | Validaciones con `yup` (auth, teams, drivers, circuits, races, perfil). |
| `middleware/` | `auth.middleware.js` (`autenticado`, `admin`), `errorHandler`, multer/cloudinary, validación de forms. |
| `jobs/` | Tareas programadas (notificaciones push, automatizaciones). |
| `express.js` / `server.js` | App de Express y arranque del servidor. |

### Convenciones backend

- Acceso a Mongo con el **driver nativo** (`mongodb`), sin ODM. Se usan
  `aggregate` con `$lookup` para "joins".
- Los `_id` de referencia se guardan como `ObjectId`.
- `connectDB()` devuelve la DB definida en la URI (`MONGO_URI`). En local la URI
  puede no incluir el nombre de la base (`.../GrandPick`).
- Endpoints públicos: listados de `drivers`, `teams`, `circuits`, `races`,
  `standings`. El resto exige `auth-token` (header).

## Frontend (`front/src/`)

| Carpeta | Rol |
|---|---|
| `pages/` | Vistas ruteadas. `pages/admin/` para el panel de control. |
| `components/` | Componentes reutilizables. `dashboardTabs/` y `dashboardForms/` para el admin. |
| `services/*.services.js` | Cliente HTTP. Todo pasa por `api.js` → `apiFetch()` (inyecta `auth-token`, maneja 401/403). |
| `context/` | Providers globales: `AlertContext`, `DialogContext`, `LoaderContext`, `NotificationsContext`. |
| `hooks/` | `usePagination`, `useCountry`, `useRedirectToTab`. |
| `assets/styles/` | CSS por vista + `globals.css` (tokens y layout base). |
| `utils/` | `helpers.js` (fechas, flags, parseo de errores), `cloudinary.js`. |
| `lab/` | Laboratorio de diseño (catálogo de componentes/tokens/patrones). Ver sección propia abajo. |

## Laboratorio de diseño (`front/lab.html` + `front/src/lab/`)

Catálogo visual de lo que ya existe en el proyecto (tokens, iconografía,
componentes reales, patrones de página, animaciones, librerías y una grilla
de las pantallas reales en vivo), para detectar inconsistencias de diseño y
evitar reinventar algo que ya está hecho. Entry point HTML separado
(`lab.html`, junto a `index.html`), con su propio `main.jsx` en `src/lab/`.

- **Cero impacto en producción**: `vite build` solo procesa el `input` por
  defecto (`index.html`); al no estar `lab.html` declarado en
  `build.rollupOptions.input` (no lo está, `vite.config.js` no lo toca),
  Vite nunca lo empaqueta ni lo copia a `dist/`. Solo es accesible
  localmente corriendo `npm run dev` → `http://localhost:5173/lab.html`.
  No está en `.gitignore`: se commitea como cualquier otro archivo, pero
  nunca se publica.
- Importa los componentes/estilos **reales** del proyecto (no son copias):
  `Podium`, `CalendarCard`, `SubmitButton`, `FloatingDialog`, `LoaderCar`,
  `PasswordInput`, etc., con datos de muestra locales. Si cambia el
  componente real, esta vista cambia sola.
- La sección "Pantallas" muestra las rutas reales en `<iframe>` (mismo
  origen, mismo dev server), escaladas con `transform: scale()` — no son
  capturas, así que tampoco se desactualizan.
- Datos hardcodeados en `src/lab/data/` (tokens, íconos usados, librerías):
  son una fotografía manual, no se generan solos. Si se agrega un token,
  ícono o librería nueva de uso recurrente, sumarla ahí también.
- Al armar un componente nuevo con estado que depende de posicionamiento
  CSS (`position: absolute` respecto al ancestro más cercano, como
  `LoaderSpinner`), el contenedor "specimen" del lab necesita
  `position: relative` — ya está puesto a nivel de `.lab-specimen-stage` en
  `lab.css`, pero tenerlo en cuenta si se arma un contenedor nuevo.

## Agentes de Claude Code (nivel proyecto)

En `.claude/agents/` hay dos subagentes especializados, checkeados en el repo
(disponibles para cualquiera que abra el proyecto, no solo en esta máquina):

| Agente | Alcance | Cuándo usarlo |
|---|---|---|
| `grandpick-backend` | `back/` | Endpoints, controllers, services, schemas (yup), middlewares, lógica de negocio (puntos, carreras, predicciones). |
| `grandpick-frontend` | `front/` | Páginas, componentes, estilos, navegación, servicios de API del cliente, formularios del admin. |

Ambos arrancan leyendo `CLAUDE.md` + los docs de `rules/` relevantes a su capa,
y terminan actualizando `rules/` según corresponda (mismas reglas que la sesión
principal). Invocarlos con el tool `Agent` pasando `subagent_type` con el
nombre de arriba.

### Convenciones frontend

- Rutas en `App.jsx`. Las privadas se envuelven en `<ProtectedRoute>`.
- Los servicios exportan un objeto default con métodos + alias
  (`findAll` / `find`, `findById` / `findDriverById`, etc.).
- Estilos: se reutilizan clases existentes antes de crear nuevas (ver
  [diseno.md](./diseno.md)).
- Imágenes servidas desde Cloudinary vía `getImageUrl()`.
- Datos de países desde API externa `countrystatecity.in`, cacheados en
  `localStorage` (`useCountry` / `getCountries`).
