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
| `NextRaceCTA` | `components/NextRaceCTA.jsx` | — | Barra/CTA de la próxima carrera. Consume `races.services`. La pastilla de tipo de sesión (`.nr-cta__round`) lleva un modificador `--qualy`/`--sprint`/`--race` con los mismos tokens `--color-stat-*` que el resto del sitio. |
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
| `FloatingPredictionCompare` | `components/FloatingPredictionCompare.jsx` | `show`, `onClose`, `myUserId`, `myLabel`, `otherUserId`, `otherLabel`, `circuitId`, `year` | Modal que compara la predicción propia vs. la de otro usuario para un GP puntual. Trae en paralelo `PredictionServices.findHistoryByUser` de ambos usuarios, filtra por `circuitId` y renderiza `CompareSessionTabs` (local al archivo) + `PredictionComparisonTable` (con `otherSession`/`myLabel`/`otherLabel`). Encabezado: card oscura con el dato del GP (`.cmp-gp-card`, ver [diseno.md](./diseno.md)) en vez del título "VS" anterior. Desktop (`isDesktop`, `window.innerWidth >= 1200`): mismo patrón que `FloatingDialog` (`gp-modal-overlay`/`gp-modal-card--wide`, envuelto en `.cmp-modal-wrap` para la cruz de cerrar), cierra con Escape (`useEscapeKey`) o con la cruz (`.gp-modal-close`). Mobile: bottom-sheet deslizable (`.gp-compare-drawer`, mismo patrón que el drawer de `PredictionHistory.jsx`), sin cruz (se cierra arrastrando o tocando afuera). Usado desde `Ranking.jsx` (modo `grand_prix`, botón "Comparar"). |

## Efectos visuales

| Componente | Ruta | Props | Para qué sirve |
|---|---|---|---|
| `Podium` | `components/Podium.jsx` | `entries`: `[{ id, rank (1-3), firstName, lastName, country (iso2), points, img, subtitle? }]` | Podio de 3 tarjetas estilo F1/F2 (foto, nombre, bandera, puntos, entrada/hover `framer-motion`, brillo en loop y `Confetti`). El brillo (`.podium__shine`) es CSS nativo (`@keyframes podium-shine`, no `framer-motion` — mismo motivo que `Confetti`), sincronizado por puesto (`--shine-delay`) para barrer siempre en orden 1º→2º→3º. Reordena solo (2º·1º·3º en desktop, apilado en mobile) y no renderiza nada si no hay entradas. Estilos en `assets/styles/podium.css`. Usado en `Home.jsx` (global), `Ranking.jsx` (global y por Gran Premio, cambia con el GP/año) y `Standings.jsx` (pilotos con `subtitle` = escudería; constructores con `img` = `isologo` del equipo y `country`/`subtitle` vacíos). |
| `Confetti` | `components/Confetti.jsx` | `count` (14), `colors`, `seed`, `speed`, `roundRatio` | Confeti que cae en loop, sin interacción, dentro del contenedor posicionado más cercano; clases `.confetti`/`.confetti__piece` + `@keyframes confetti-fall` en `podium.css`. **Excepción a la regla del proyecto**: el loop es CSS nativo (`animation-iteration-count: infinite`), no `framer-motion` — la versión con `framer-motion` se congelaba en producción sin causa aislable (ver [diseno.md](./diseno.md)). No renderiza con `prefers-reduced-motion`. `seed`/`speed`/`roundRatio` permiten variar cada instancia (distribución, velocidad, círculos vs. tiras). Usado en las 3 tarjetas del `Podium` (Home, Ranking, Standings). |
| `Reveal` | `components/Reveal.jsx` | `as` (tag string o componente con forwardRef, ej. `Link`; default `"div"`), `delay`, `y` (24), `amount` (0.2), `children`, `...props` | Envoltorio genérico de fade + `y` al entrar en viewport (`framer-motion` `whileInView`, `once: true`), respeta `useReducedMotion()`. `as` string usa `motion[as]`; con un componente custom usa `motion(Component)` (memoizado por identidad de `as`, para no remontar el subárbol en cada render del padre). Usado en `Home.jsx` (secciones y las 3 `info-card`) y en las grillas de `Drivers.jsx`/`Teams.jsx`/`Circuits.jsx`/`Calendar.jsx` con delay escalonado por índice. Ver [diseno.md](./diseno.md). |

## Calendario

| Componente | Ruta | Props | Para qué sirve |
|---|---|---|---|
| `CalendarCard` | `components/calendar/CalendarCard.jsx` | `race`, `roundNumber`, `status` (`finished`/`current`/`next`/`upcoming`), `dayLabel`, `monthLabel`, `practices` (de `Practice_Sessions` del circuito), `predictionsByRaceId` (mapa `{ raceId: true }` con las sesiones que el usuario logueado ya predijo) | Tarjeta del calendario: riel con el número de ronda, fecha con estado y switch «Mi tiempo / Tiempo de circuito» propio de cada tarjeta. Toda la fila (`cal-card__row`) abre/cierra el panel de sesiones al click: algunos usuarios tocaban la fecha esperando que reaccionara y no identificaban el ícono como botón. El botón (`cal-card__toggle`) es el control accesible real (sin `onClick` propio; el click nativo burbujea a la fila), así que con teclado se llega por Tab y se activa con Enter/Espacio igual que antes; su ícono es una flecha (`bi-chevron-down`) que rota 180° al abrir, no un reloj — con la fila entera clickeable el reloj se leía como decoración, y una flecha es el símbolo estándar de "esto se expande" (y más liviano al repetirse por cada GP del calendario). Cada sesión ya pasada (`it.iso` <= ahora) muestra un badge de estado ✓ (`.cal-session__status-badge`, no es clickeable); las predecibles (clasificación/sprint/carrera, no prácticas ni SQ) con predicción propia suman un botón real (`.cal-session__predict-btn`, mismo azul `#4c86b7` que `.submit-btn`/`.btn-row-action` — ver la familia de botón circular en `rules/diseno.md`) que linkea a `/prediction-history?gp=<circuitId>&session=<type>`. Estilos en `assets/styles/calendar.css` (prefijo `cal-`). Usado en `Calendar.jsx`, que arma `predictionsByRaceId` con `PredictionsServices.findHistoryByUser` solo si hay `auth-token` (página pública). |

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
| `CountryDisplay` | `components/CountryDisplay.jsx` | `iso2`, `showName`, `className` | Muestra bandera emoji + nombre de país (read-only). Usa `useCountry`. El margen `me-1` de la bandera solo se aplica con `showName` (sin nombre la bandera queda centrada en su contenedor). |

## Formularios de dominio (panel admin)

Todos comparten la firma: `initialData`, `onSubmit`, `submitLabel`, `isEdit`, `errorsForm`.

| Componente | Ruta | Notas |
|---|---|---|
| `TeamForm` | `components/dashboardForms/TeamForm.jsx` | Alta/edición de escudería. |
| `DriverForm` | `components/dashboardForms/DriverForm.jsx` | Alta/edición de piloto: solo datos propios (nombre, trigrama, número opcional, país, imagen). Sin campo de escudería — eso se maneja en `Assignments`. |
| `CircuitForm` | `components/dashboardForms/CircuitForm.jsx` | Alta/edición de circuito. |
| `RaceForm` | `components/dashboardForms/RaceForm.jsx` | Fin de semana de carrera (multi-sesión). Props: `initialData`, `onSave`, `submitText`, `action`, `race_types`. |
| `PredictionsForm` | `components/PredictionsForm.jsx` | `points`, `race_types`, `onDriverChange`. Grilla de posiciones piloto↔posición (predicción / carga de resultados). |

## Tablas

| Componente | Ruta | Props | Para qué sirve |
|---|---|---|---|
| `DriversTable` | `components/dashboardTabs/DriversTable.jsx` | `drivers`, `onEdit`, `onDelete`, `pageSize` | Tabla admin de pilotos. Familia `admin-table`. Sin columna Estado ni habilitar/deshabilitar (se sacó del admin; `enableDriver`/`disableDriver` siguen en el backend sin UI). |
| `TeamsTable` | `components/dashboardTabs/TeamsTable.jsx` | `teams`, `onEdit`, `onDelete`, `pageSize` | Tabla admin de escuderías. |
| `CircuitsTable` | `components/dashboardTabs/CircuitsTable.jsx` | `circuits`, `onEdit`, `onDelete`, `pageSize` | Tabla admin de circuitos. |
| `RacesTable` | `components/dashboardTabs/RacesTable.jsx` | `races`, `onEdit`, `onDelete`, `pageSize` | Tabla admin de carreras. |
| `UsersTable` | `components/dashboardTabs/UsersTable.jsx` | `users`, `onToggleBlock`, `pageSize` | Tabla admin de usuarios. |
| `Assignments` (`TeamsDriversAdmin`) | `components/dashboardTabs/Assignments.jsx` | `searchTerm` | Único lugar donde se gestiona piloto↔escudería: columna "Cambiar a" (equipo) + columna "Estado" (Titular/Suplente). Máximo 2 titulares por equipo (sin límite de pilotos totales); el servidor valida esto también (`PATCH /api/dashboard/drivers/assignments`), no solo el cliente. Muestra todos los pilotos, incluidos los deshabilitados. Ver `rules/logica.md`. |
| `NotificationsTab` | `components/dashboardTabs/NotificationsTab.jsx` | `users` | Envío de notificaciones desde el admin. |

> **Tablas públicas** (Ranking, Clasificación): no hay componente de tabla
> reutilizable, se arma con las clases `ranking-*` (ver [diseno.md](./diseno.md)).
> Candidata a futura extracción: `PublicStandingsTable`.

## Tarjetas de piloto

| Componente | Ruta | Props | Para qué sirve |
|---|---|---|---|
| `DriverCardDesktop` | `components/drivers/DriverCardDesktop.jsx` | `driver` | Card de piloto (grid desktop en `/drivers`). |
| `DriverCardMobile` | `components/drivers/DriverCardMobile.jsx` | `driver`, `teamLogo` | Card de piloto (mobile). |
| `ReserveDriverCard` | `components/drivers/ReserveDriverCard.jsx` | `driver` (`full_name`, `trigram`, `country`, `team_info`) | Card de piloto suplente: igual a `DriverCardMobile` sin número y con imagen genérica `suplente.png`. |
| `ReserveDriversSection` | `components/drivers/ReserveDriversSection.jsx` | `drivers` | Sección "PILOTOS SUPLENTES" (divisor + header + grilla). No renderiza nada si `drivers` está vacío. Usada al final de `Drivers.jsx`. |

## Predicciones (historial y comparación)

| Componente | Ruta | Props | Para qué sirve |
|---|---|---|---|
| `SessionTabs` | `components/predictions/SessionTabs.jsx` | `sessions`, `selectedSessionType`, `onSelect` | Tabs de sesión (SPRINT/QUALY/RACE) con su estado (`finished`/`upcoming`/`pending_results`/`none`) y el puntaje de la sesión. Exporta también `getSessionButtonStatus(session)`. Usado solo en `PredictionHistory.jsx` (mobile y desktop) — tema claro, un único usuario, el puntaje no es ambiguo. |
| `CompareSessionTabs` | `components/FloatingPredictionCompare.jsx` (local, no exportado) | `sessions`, `selectedSessionType`, `onSelect` | Tabs de sesión propias del modal de comparación: solo el nombre + un puntito del color de sesión (`--color-stat-sprint/qualy/race`), sin fecha ni puntaje — con dos usuarios en pantalla un puntaje suelto en el tab no decía de quién era (ya se resuelve en la tabla). Reusa `getSessionButtonStatus` de `SessionTabs.jsx` para habilitar/deshabilitar. |
| `PredictionComparisonTable` | `components/predictions/PredictionComparisonTable.jsx` | `session`, `otherSession` (opcional), `myLabel` (default `"Vos"`), `otherLabel` (opcional), `isMine` (default `true`, resalta el nombre en celeste) | Ficha oscura (`cmp-*`), siempre 10 filas. Sin `otherSession` (historial): 4 columnas `#` / `Tu predicción` (`Predicción` si `isMine` es false) / `Resultado real` / `Puntos` (píldora por fila). Con `otherSession`: 4 columnas (`#` / Resultado real / `{myLabel}` / `{otherLabel}`, clases `cmp-*`) con `CompareDriverCell` — nombre completo en desktop, trigrama (`driver.trigram`) en el bottom-sheet mobile según el contenedor (`.gp-modal-card` vs `.gp-compare-drawer`), sin que el componente sepa en cuál está. Los puntos de cada predicción van como píldora pegada al piloto (`CompareMiniPts`), no en columna aparte; el total de puntos de la sesión de cada usuario va junto a su nombre en el encabezado. Reutiliza el cálculo de match/puntos (incluido el ajuste de qualy `/3` antes del 2026-05-03). |
| `GpCard` | `components/predictions/GpCard.jsx` | `circuit`, `dateStart`, `dateEnd` | Card oscura (`cmp-gp-card`) con bandera + GP + circuito y fecha (`formatRaceDate`). Usada en `FloatingPredictionCompare` y en el drawer mobile de `PredictionHistory`. |

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
| `useEscapeKey` | `hooks/useEscapeKey.js` | `useEscapeKey(isActive, onEscape)` | Agrega un listener de `keydown` en `document` solo mientras `isActive` es `true`; llama a `onEscape` con `Escape` y limpia el listener al desmontar o cuando `isActive` pasa a `false`. Usado en los 4 modales `Floating*` (`FloatingDialog` con `onCancel`; `FloatingEditProfile`, `FloatingChangePassword`, `FloatingPredictionCompare` con `onClose`) para cerrar con Escape en desktop. |
| `useModalPhase` | `hooks/useModalPhase.js` | `useModalPhase(show, closeMs = 200)` → `"open" | "closing" | "closed"` | Maneja entrada y salida de modales con CSS (clases `gp-modal-overlay--css` / `.is-closing`, keyframes en `components.css`) en vez de framer-motion: al cerrar espera `closeMs` antes de desmontar. Usado en `FloatingDialog`, `FloatingChangePassword` y `FloatingEditProfile`. |
