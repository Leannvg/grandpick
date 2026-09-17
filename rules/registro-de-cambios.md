# Registro de cambios

Orden cronológico inverso (lo más nuevo arriba).

## 2026-09-16 · Agentes especializados de Claude Code

- `.claude/agents/grandpick-backend.md` y `.claude/agents/grandpick-frontend.md`:
  subagentes a nivel proyecto (quedan en el repo, no son de usuario) para
  trabajar en `back/` y `front/` respectivamente, cada uno con su propia
  arquitectura, convenciones y checklist de actualización de `rules/`.
- Documentado en `rules/estructura.md`.

## 2026-09-10 · Catálogo de componentes

- Nuevo `rules/componentes.md`: inventario de todos los componentes, contexts y
  hooks del front con sus props y notas de reuso.
- Convención agregada al `CLAUDE.md` y a `rules/README.md`: revisar el catálogo
  antes de crear un componente y sumar los nuevos al mismo.

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
