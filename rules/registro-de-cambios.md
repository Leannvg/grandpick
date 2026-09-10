# Registro de cambios

Orden cronológico inverso (lo más nuevo arriba).

## 2026-09-10 · Clasificación de pilotos

- **Backend**: nuevo endpoint público `GET /api/standings/drivers?year=` que arma
  la tabla de puntos del campeonato de pilotos a partir de los resultados
  cargados (`services/drivers.services.js` → `findDriversStandings`).
- **Frontend**: nueva vista `/standings` (`pages/Standings.jsx` +
  `assets/styles/standings.css`) con la tabla **Posición · Nombre · Nacionalidad ·
  Equipo Actual · Puntos**, reutilizando el diseño `ranking-*`.
- **Nav**: nuevo ítem **CLASIFICACIÓN** en el mega menú **F1 ACTUAL**.
- Regla: suman Carrera + Sprint; la Qualy no otorga puntos al campeonato.
- Detalle completo: [features/clasificacion-pilotos.md](./features/clasificacion-pilotos.md).
- **Docs**: se crea la carpeta `rules/` con la documentación viva del proyecto
  (estructura, diseño, lógica, features, este changelog).
