# Feature · Clasificación de pilotos

**Fecha:** 2026-09-10
**Objetivo:** mostrar la tabla de puntos que los pilotos fueron sumando en la
temporada, calculada a partir de los resultados ya cargados en la base.

## Alcance

- Nueva vista pública `/standings` con la tabla del campeonato de pilotos.
- Nuevo ítem **CLASIFICACIÓN** en el mega menú **F1 ACTUAL**.
- La tabla muestra: **Posición · Nombre · Nacionalidad · Equipo Actual · Puntos**.
- Reutiliza el diseño de tablas `ranking-*` para mantener armonía visual.

## Regla de puntaje

- Suman **Carrera + Sprint**. La Qualy no otorga puntos (criterio F1 real).
- Puntos por sesión = `points_system.points[position - 1]`.
- Total = suma sobre todas las `Races` del año con `results` cargados.
- Orden: puntos desc; desempate provisional por nombre (A→Z).
- Se listan los pilotos con puntos > 0 **o** `active === true`.
- El año es parametrizable (`?year=`), por defecto el año actual.

## Backend

| Archivo | Cambio |
|---|---|
| `services/drivers.services.js` | + `findDriversStandings(year)`: agrega puntos por piloto y devuelve el array ordenado con `position`, `team` (`{_id,name,full_team_name,color}`) y datos del piloto. |
| `api/controllers/drivers.api.controllers.js` | + `driversStandings(req,res,next)`: lee `req.query.year` y responde el array. |
| `api/routes/drivers.api.routes.js` | + `GET /api/standings/drivers` (público, sin auth). Declarado antes de `/api/drivers/:driverId`. |

Respuesta (`200`):
```json
[
  { "_id":"...", "position":1, "full_name":"Kimi Antonelli", "country":"IT",
    "number":"12", "trigram":"ANT", "img":"...", "active":true,
    "team":{ "_id":"...", "name":"Mercedes", "full_team_name":"...", "color":"#..." },
    "points":267 }
]
```

## Frontend

| Archivo | Cambio |
|---|---|
| `services/drivers.services.js` | + `findDriversStandings(year)` / alias `findStandings` → `GET /api/standings/drivers?year=`. |
| `pages/Standings.jsx` | Nueva vista. Header estándar + filtros (año, buscador) + tabla `ranking-table standings-table`. Usa `<CountryDisplay>` para nacionalidad y un punto de color con `--team-color` para la escudería. Top 3 con clases `pos-1/2/3`. |
| `assets/styles/standings.css` | Estilos propios mínimos (celda de piloto, punto de color de equipo). El resto sale de `ranking.css`. |
| `App.jsx` | + import `Standings` y ruta pública `/standings`. |
| `components/Nav.jsx` | + ítem `{ to: "/standings", label: "CLASIFICACIÓN" }` en el mega menú `info`. Las columnas del mega menú pasan a `col-md-3` cuando hay 4 ítems. |

## Ajustes posteriores (2026-09-10)

- La columna se llama **"Piloto"** (antes "Nombre").
- El nombre se divide: nombre de pila en minúscula con inicial mayúscula +
  apellido en **MAYÚSCULA y negrita**. Se quitó el número de piloto.
- Columnas **Nacionalidad** y **Equipo Actual** alineadas a la izquierda.

## Notas / posibles mejoras futuras

- Desempate real estilo F1 (cantidad de P1, P2, ... ) si se necesita precisión.
- Cachear el cálculo si el volumen de carreras crece.

## Constructores (2026-09-21)

Se agregó la tabla de constructores en la misma vista `/standings`, con un
toggle **Pilotos / Constructores** (mismo patrón `.info-page__mode-btn` que
Global/Por Gran Premio en `Ranking.jsx`).

**No reutiliza el cálculo de pilotos tal cual**, a propósito: sumar por el
equipo *actual* de cada piloto (como hace `findDriversStandings`) da mal en
cuanto un piloto cambió de escudería a mitad de temporada, porque le
atribuiría retroactivamente todos sus puntos viejos al equipo nuevo. Se
detectó un caso real de esto en la base (un piloto que puntuó en carreras ya
cargadas y hoy figura sin equipo/inactivo).

En su lugar, `Races.results` suma un campo `team` por resultado (la
escudería con la que ese piloto corrió *esa* carrera puntual — ver
[logica.md](../logica.md)), y constructores suma por ese campo.

### Backend

| Archivo | Cambio |
|---|---|
| `back/api/controllers/races.api.controllers.js` (`create`, `editById`) | Persisten `results[].team` junto a `position`/`driver`. |
| `back/services/races.services.js` | Los aggregates de lectura resuelven `results[].team` contra `Teams` (igual que ya hacían con `driver`). |
| `back/services/teams.services.js` | + `findConstructorsStandings(year)`: suma puntos por `results[].team`; devuelve `{ standings, unresolvedResults }` — `unresolvedResults` son resultados puntuables sin `team` cargado (carreras previas a este campo), que no se cuentan. |
| `back/api/controllers/teams.api.controllers.js` + `back/api/routes/teams.api.routes.js` | + `GET /api/standings/constructors?year=` (público), declarado antes de `/api/teams/:teamId`. |

Respuesta (`200`):
```json
{
  "standings": [
    { "_id":"...", "position":1, "name":"McLaren", "full_team_name":"...",
      "color":"#...", "logo":"...", "isologo":"...", "points":520 }
  ],
  "unresolvedResults": 12
}
```

### Frontend

| Archivo | Cambio |
|---|---|
| `front/src/components/PredictionsForm.jsx` (usado solo dentro de `RaceForm.jsx`, no en las predicciones de usuarios) | Cada fila de resultado suma un segundo `SearchableSelect` para la escudería (`.gp-result-team-select`), alimentado por `TeamsServices.findAll()`. Al elegir el piloto se sugiere su equipo actual (`driver.team_info`), pero queda editable. Callback renombrado `onDriverChange` → `onResultChange(pointId, position, driverId, teamId)`. |
| `front/src/services/teams.services.js` | + `findConstructorsStandings(year)` → `GET /api/standings/constructors?year=`. |
| `front/src/pages/Standings.jsx` | Toggle Pilotos/Constructores; tabla constructores (Pos · Escudería · Puntos); aviso si `unresolvedResults > 0`; `Podium` reutilizado con `img: team.isologo` para el top 3. |

### Backfill de carreras ya cargadas

Las carreras cargadas antes de este cambio no tienen `team` en sus
resultados y por lo tanto no suman a constructores (quedan en
`unresolvedResults`) hasta completarlas a mano reeditándolas en el admin
(`RaceForm.jsx`, ahora con el selector de escudería) con el equipo real que
tenía cada piloto en esa carrera puntual — investigado carrera por carrera,
no asumido por el equipo actual ni por el anuncio de alineación de
pre-temporada (puede no reflejar cambios posteriores).
