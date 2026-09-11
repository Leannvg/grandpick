# GrandPick

Monorepo: `back/` (API Node + Express + MongoDB nativo), `front/` (React + Vite),
`rules/` (documentación viva del proyecto).

## Reglas de trabajo (siempre)

1. **Antes de cualquier cambio**, leer la carpeta [`rules/`](./rules/):
   - `rules/README.md` — índice y convenciones
   - `rules/estructura.md` — capas y organización de `back/` y `front/`
   - `rules/diseno.md` — tokens CSS, patrón de tablas (`ranking-*`), navegación
   - `rules/logica.md` — modelo de datos Mongo y reglas de negocio
   - `rules/features/` — detalle por feature
2. **Después de cada cambio**, actualizar `rules/`:
   - agregar/editar el doc de la feature en `rules/features/`
   - anotar la entrada en `rules/registro-de-cambios.md`
   - si cambió diseño / estructura / lógica transversal, actualizar ese doc
3. **Commits en español**, imperativo corto. Terminar con la línea de
   `Co-Authored-By` que indique la sesión.
4. **Git**: usar la cuenta vinculada a la carpeta. Todos los cambios se pushean a
   `main` para desplegar (front en Vercel, API en Railway).
5. Reutilizar componentes y clases CSS existentes antes de crear nuevos
   (armonía de diseño).

## Comandos

- Front: `cd front && npm run build` (verificar que compila antes de commitear)
- Back: `cd back && node --check <archivo>` para chequear sintaxis
