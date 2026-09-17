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
