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
- Tabla de constructores (sumar por escudería) reutilizando el mismo cálculo.
- Cachear el cálculo si el volumen de carreras crece.
