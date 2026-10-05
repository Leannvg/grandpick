# Prácticas y clasificación sprint

Horarios de FP1, FP2, FP3 y SQ (clasificación sprint) por circuito y año.
Son solo informativos: no generan predicciones, puntos ni notificaciones.

## Datos

- Colección `Practice_Sessions`: `id_circuit` (ObjectId), `year` (Number),
  `name` (`FP1` | `FP2` | `FP3` | `SQ`), `date_utc` (Date, UTC).
- `SQ` existe solo en fines de semana sprint. Es distinta de la clasificación
  principal, que sigue en `Races` (tipo `qualifying`).
- Las prácticas no van en `Races` para que no afecten puntos, predicciones ni
  notificaciones.

## Carga

- Admin: sección «Prácticas» en `RaceForm.jsx`. Se ingresa la hora en la zona
  del circuito y se guarda en UTC con luxon. Solo se reemplazan si se tocaron.
- Endpoints: `GET /api/practice-sessions?year=&circuitId=` (público) y
  `PUT /api/dashboard/practice-sessions/:circuitId/:year` (admin).
- Carga masiva 2026: `back/scripts/import-practice-sessions-2026.js` lee
  `back/data/practice-sessions-2026.json` (horas locales por GP). Sin
  `--apply` solo simula. Antes de guardar valida que la clasificación calculada
  coincida con la de `Races` (tolerancia 1 min); si algo no coincide, no guarda
  nada. Reemplaza las prácticas del año de cada circuito.

## Calendario

- `CalendarCard.jsx` (`buildSchedule`):
  - Grupo «Prácticas»: `FP1`–`FP3` como «Práctica N», 60 MIN.
  - Grupo «Fin de semana sprint»: «Sprint» (35 MIN.) y «Clasificación sprint»
    (45 MIN.). Si hay `SQ` cargada, esa es la clasificación sprint; si no, se usa
    la clasificación de `Races` anterior al sprint.
  - Grupo «Clasificación y carrera»: clasificación y carrera.
- Sin datos de prácticas, el grupo «Prácticas» no aparece.
- Ver `rules/features/` y `rules/componentes.md` (`CalendarCard`).

## Pendiente

- Desde la temporada siguiente, cargar los horarios desde el admin (el script
  es solo para la carga inicial 2026).
