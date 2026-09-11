# Catálogo de componentes (`front/src`)

Inventario de componentes reutilizables. **Antes de crear un componente nuevo,
revisar si ya existe algo acá que sirva o se pueda extender.**

Convención: al crear un componente nuevo, agregar su fila en la sección
correspondiente (ruta, props, para qué sirve, notas de reuso).

---

## Layout y navegación

| Componente | Ruta | Props | Para qué sirve |
|---|---|---|---|
| `Nav` | `components/Nav.jsx` | `onLogout`, `autenticado`, `esAdmin` | Navbar sticky + mega menús (F1 ACTUAL / TUTORIALES). Los ítems de cada mega menú se definen en `renderMegaMenu`. |
| `Footer` | `components/Footer.jsx` | — | Pie de página. |
| `BackButton` | `components/BackButton.jsx` | `to`, `text` | Botón "volver" (navega a `to`). |
| `ProtectedRoute` | `components/ProtectedRoute.jsx` | `children`, `isAuthenticated`, `isAdmin`, `adminOnly` | Wrapper de rutas privadas en `App.jsx`. Redirige a login o home. |
| `Glossary` | `components/Glossary.jsx` | — | Panel flotante de glosario (solo autenticado). Data en `data/glosary.json`. |
| `InfoSection` | `components/InfoSection.jsx` | `body`, `images`, `tabs` | Render de contenido de las páginas de información/tutoriales. |
| `NextRaceCTA` | `components/NextRaceCTA.jsx` | — | Barra/CTA de la próxima carrera. Consume `races.services`. |
| `InstallAppBanner` | `components/InstallAppBanner.jsx` | — | Banner PWA "instalar app". |
| `AuthListener` | `components/AuthListener.jsx` | — | Escucha eventos `auth:logout` globales. Sin UI. |

## Feedback: alertas y modales

| Componente | Ruta | Props / API | Para qué sirve |
|---|---|---|---|
| `FloatingAlert` | `components/FloatingAlert.jsx` | `show`, `message`, `type` (`success`/`danger`/`warning`/`info`), `onClose` | Alerta deslizante superior. **Usar vía `useAlert()`**, no directo. |
| `AlertContext` | `context/AlertContext.jsx` | `useAlert()` → `showAlert(msg, type, autoClose)`, `closeAlert`, `alert` | Estado global de alertas. |
| `FloatingDialog` | `components/FloatingDialog.jsx` | `show`, `title`, `message`, `onConfirm`, `onCancel`, `confirmText`, `cancelText`, `confirmVariant`, `cancelVariant` | Modal de confirmación. **Usar vía `useDialog()`**. |
| `DialogContext` | `context/DialogContext.jsx` | `useDialog()` → `confirmDialog({...})` (devuelve `Promise<boolean>`) | Confirmaciones tipo `confirm()` con estilo propio. |
| `FloatingChangePassword` | `components/FloatingChangePassword.jsx` | `show`, `onClose`, `usuario` | Modal cambio de contraseña. |
| `FloatingEditProfile` | `components/FloatingEditProfile.jsx` | `show`, `onClose`, `usuario`, `onUpdated` | Modal edición de perfil. |

## Loaders

| Componente | Ruta | Props / API | Para qué sirve |
|---|---|---|---|
| `LoaderCar` | `components/LoaderCar.jsx` | `message`, `fullScreen` | Loader principal (auto de F1). Se dispara desde `App.jsx` con el estado de `useLoader()`. |
| `LoaderSpinner` | `components/LoaderSpinner.jsx` | — | Spinner chico para bloques puntuales. |
| `LoaderContext` | `context/LoaderContext.jsx` | `useLoader()` → `loading`, `showLoader()`, `hideLoader()` | Estado global del loader de página. |

## Formularios: inputs y selects

| Componente | Ruta | Props | Para qué sirve |
|---|---|---|---|
| `SubmitButton` | `components/SubmitButton.jsx` | `ariaLabel`, `disabled`, `className`, `style`, `onClick`, `...props` | Botón de envío estándar de formularios. |
| `PasswordInput` | `components/PasswordInput.jsx` | `label`, `value`, `onChange`, `error`, `placeholder`, `disabled`, `id` | Input de contraseña con toggle ver/ocultar. |
| `UploadImage` | `components/UploadImage.jsx` | `onImageSelect`, `label`, `isInvalid`, `error` | Selector + preview de imagen (sube a Cloudinary vía el back). |
| `SearchableSelect` | `components/SearchableSelect.jsx` | `options` (objetos con `_id` + `name`/`gp_name`/`full_name`), `value`, `onChange`, `isInvalid`, `inputId`, `isDisabled`, `isDriver`, `placeholder`, `getOptionDisabled` | Select con búsqueda (react-select) + soporte de emoji de bandera y color de equipo. Base de todos los selects ricos. |
| `CountrySelect` | `components/CountrySelect.jsx` | `countryFunction`, `defaultValue`, `isInvalid`, `error`, `hideLabel`, `inputId` | Select de países (usa API externa + `SearchableSelect`). |
| `CitySelect` | `components/CitySelect.jsx` | `cityFunction`, `country`, `defaultValue`, `isInvalid`, `error`, `hideLabel` | Select de ciudades/estados dependiente de `country`. |
| `CountryDisplay` | `components/CountryDisplay.jsx` | `iso2`, `showName`, `className` | Muestra bandera emoji + nombre de país (read-only). Usa `useCountry`. |

## Formularios de dominio (panel admin)

Todos comparten la firma: `initialData`, `onSubmit`, `submitLabel`, `isEdit`, `errorsForm`.

| Componente | Ruta | Notas |
|---|---|---|
| `TeamForm` | `components/dashboardForms/TeamForm.jsx` | Alta/edición de escudería. |
| `DriverForm` | `components/dashboardForms/DriverForm.jsx` | Alta/edición de piloto. |
| `CircuitForm` | `components/dashboardForms/CircuitForm.jsx` | Alta/edición de circuito. |
| `RaceForm` | `components/dashboardForms/RaceForm.jsx` | Fin de semana de carrera (multi-sesión). Props: `initialData`, `onSave`, `submitText`, `action`, `race_types`. |
| `PredictionsForm` | `components/PredictionsForm.jsx` | `points`, `race_types`, `onDriverChange`. Grilla de posiciones piloto↔posición (predicción / carga de resultados). |

## Tablas

| Componente | Ruta | Props | Para qué sirve |
|---|---|---|---|
| `DriversTable` | `components/dashboardTabs/DriversTable.jsx` | `drivers`, `onEdit`, `onDelete`, `onToggle`, `pageSize` | Tabla admin de pilotos. Familia `admin-table`. |
| `TeamsTable` | `components/dashboardTabs/TeamsTable.jsx` | `teams`, `onEdit`, `onDelete`, `pageSize` | Tabla admin de escuderías. |
| `CircuitsTable` | `components/dashboardTabs/CircuitsTable.jsx` | `circuits`, `onEdit`, `onDelete`, `pageSize` | Tabla admin de circuitos. |
| `RacesTable` | `components/dashboardTabs/RacesTable.jsx` | `races`, `onEdit`, `onDelete`, `pageSize` | Tabla admin de carreras. |
| `UsersTable` | `components/dashboardTabs/UsersTable.jsx` | `users`, `onToggleBlock`, `pageSize` | Tabla admin de usuarios. |
| `Assignments` | `components/dashboardTabs/Assignments.jsx` | `searchTerm` | Asignación pilotos↔escuderías. |
| `NotificationsTab` | `components/dashboardTabs/NotificationsTab.jsx` | `users` | Envío de notificaciones desde el admin. |

> **Tablas públicas** (Ranking, Clasificación): no hay componente de tabla
> reutilizable, se arma con las clases `ranking-*` (ver [diseno.md](./diseno.md)).
> Candidata a futura extracción: `PublicStandingsTable`.

## Tarjetas de piloto

| Componente | Ruta | Props | Para qué sirve |
|---|---|---|---|
| `DriverCardDesktop` | `components/drivers/DriverCardDesktop.jsx` | `driver` | Card de piloto (grid desktop en `/drivers`). |
| `DriverCardMobile` | `components/drivers/DriverCardMobile.jsx` | `driver`, `teamLogo` | Card de piloto (mobile). |

## Countdowns

| Componente | Ruta | Props | Para qué sirve |
|---|---|---|---|
| `CountdownToRace` | `components/countdown/CountdownToRace.jsx` | `raceDate`, `totalDuration`, `onExpire`, `onStartRace` | Cuenta regresiva al inicio de la carrera. |
| `CountdownToOpen` | `components/countdown/CountdownToOpen.jsx` | `timeToOpen`, `onOpen` | Cuenta regresiva a la apertura de la ventana de predicción. |

## Notificaciones

| Componente | Ruta | Props / API | Para qué sirve |
|---|---|---|---|
| `NotificationsBell` | `components/NotificationsBell.jsx` | `onToggle`, `isDesktop`, `forceOpen` | Campana + dropdown de notificaciones en el `Nav`. |
| `NotificationsContext` | `context/NotificationsContext.jsx` | `useNotifications()` → `notifications`, `deleteNotification`, `markAsSeen`, `markAllAsSeen`, `deleteAllNotifications` | Estado global de notificaciones (socket + REST). Provider necesita `userId`. |

## Hooks

| Hook | Ruta | API | Para qué sirve |
|---|---|---|---|
| `usePagination` | `hooks/usePagination.js` | `usePagination(data, initialPageSize)` → `page`, `pageSize`, `setPage`, `setPageSize`, `totalPages`, `paginatedData` | Paginación en memoria. Usado por todas las tablas. |
| `useCountry` | `hooks/useCountry.js` | `useCountry(iso2)` → `{ name, emoji, loading }` | Resuelve nombre + bandera de un país ISO2 (cache en localStorage). |
| `useRedirectToTab` | `hooks/useRedirectToTab.js` | `useRedirectToTab()` → `redirectToTab(nombreTab)` | Vuelve al dashboard admin en una pestaña puntual. |
