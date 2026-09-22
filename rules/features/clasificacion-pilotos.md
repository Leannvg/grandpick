# Feature · Clasificación de pilotos

**Fecha:** 2026-09-10
**Objetivo:** mostrar la tabla de puntos que los pilotos fueron sumando en la
temporada, calculada a partir de los resultados ya cargados en la base.

## Alcance

- Nueva vista pública `/standings` con la tabla del campeonato de pilotos.
- Nuevo ítem **CAMPEONATO** en el mega menú **F1 ACTUAL** (antes "CLASIFICACIÓN";
  renombrado 2026-09-21, junto con los títulos "CAMPEONATO DE PILOTOS" /
  "CAMPEONATO DE CONSTRUCTORES").
- La tabla muestra: **Posición · Piloto · Puntos totales · Nacionalidad · Equipo Actual**
  (mismo orden de las 3 primeras columnas — Posición, Piloto/Escudería, Puntos
  totales — que la tabla de constructores, reordenado 2026-09-21).
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
| `components/Nav.jsx` | + ítem `{ to: "/standings", label: "CAMPEONATO" }` en el mega menú `info`. Las columnas del mega menú pasan a `col-md-3` cuando hay 4 ítems. |

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
      "color":"#...", "logo":"...", "isologo":"...", "points":520,
      "drivers": [
        { "_id":"...", "full_name":"Lando Norris", "trigram":"NOR", "points":280 },
        { "_id":"...", "full_name":"Oscar Piastri", "trigram":"PIA", "points":240 }
      ] }
  ],
  "unresolvedResults": 12
}
```

Se listan **todas** las escuderías (sumen o no puntos todavía), no solo las
que ya puntuaron. `drivers` es el plantel **actual** de cada escudería
(`Drivers.team`, mismo criterio que la tabla de escuderías del admin — no el
histórico por carrera), con el total de puntos de la temporada de cada
piloto (mismo cálculo que pilotos), ordenado de mayor a menor.

### Frontend

| Archivo | Cambio |
|---|---|
| `front/src/components/PredictionsForm.jsx` (usado solo dentro de `RaceForm.jsx`, no en las predicciones de usuarios) | Cada fila de resultado suma un segundo `SearchableSelect` para la escudería (`.gp-result-team-select`), alimentado por `TeamsServices.findAll()`. Al elegir el piloto se sugiere su equipo actual (`driver.team_info`), pero queda editable. Callback renombrado `onDriverChange` → `onResultChange(pointId, position, driverId, teamId)`. |
| `front/src/services/teams.services.js` | + `findConstructorsStandings(year)` → `GET /api/standings/constructors?year=`. |
| `front/src/pages/Standings.jsx` | Toggle Pilotos/Constructores; tabla constructores (Posición · Escudería · Puntos totales · Pilotos, todas las escuderías aunque tengan 0 puntos); columna "Pilotos" con una pill por piloto del plantel actual (`.team-driver-pill`, mismo lenguaje visual que `.admin-status-pill.pill-driver` del admin), identificado por **trigrama** (`title` con el nombre completo al pasar el mouse) y sus puntos de la temporada destacados en rojo (`.team-driver-pill__points`, `--color-red`, sin fondo ni cápsula); aviso si `unresolvedResults > 0`; `Podium` reutilizado con `img: team.isologo` para el top 3. |
| `front/src/assets/styles/standings.css` | + `.team-driver-pill` / `.team-driver-pill--empty` / `.team-driver-pill__points`; `.standings-table--constructors` (min-width mayor en la tabla de constructores por la columna de pilotos). |

### Backfill de las 33 carreras ya cargadas (hecho, 2026-09-21)

Se investigó carrera por carrera (fuentes: RacingNews365, Sky Sports, F1.com)
qué escudería tenía cada piloto en cada una de las 14 rondas ya jugadas de
2026, y se corrió un script de una sola vez (`back/scripts/backfillResultsTeam.js`,
ya descartado tras aplicarse) que completó `results[].team` en los 222
resultados de las 33 carreras. `unresolvedResults` quedó en 0.

De los 20 pilotos que puntuaron, **18 ya tenían el equipo correcto en
`Drivers.team`** (su equipo "actual" coincidía con el de todas sus
apariciones). Dos necesitaron un valor distinto según la fecha, por un caso
real de reemplazo por lesión:
- **Hadjar**: corrió con **Red Bull** en las 11 rondas donde aparece
  (Australia 05/03 a Hungría 23/07). La base lo tenía sin equipo/inactivo.
- **Lawson**: corrió con **Racing Bulls** en esas mismas rondas, y pasó a
  **Red Bull** desde Países Bajos (20/08) en adelante — reemplazando a un
  Hadjar que se fracturó la muñeca en el receso de verano y se perdió los
  Grandes Premios de Países Bajos, Italia y España. La base lo tenía fijo en
  Red Bull para toda la temporada.
- Como consecuencia, Tsunoda (que reemplazó a Lawson en Racing Bulls durante
  esas 3 fechas) ya tenía el equipo correcto — solo aparece puntuando en
  Italia, donde su equipo actual (Racing Bulls) ya era el dato correcto.

Verificación posterior (`Mercedes 503 pts = Antonelli 292 + Russell 211`,
exacto) confirmó el cálculo. De acá en adelante, toda carrera nueva captura
`team` al cargar resultados (`RaceForm.jsx`), así que no debería volver a
hacer falta un backfill manual salvo que se detecte otro caso similar no
capturado a tiempo por el admin.
