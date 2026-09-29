# GrandPick

Monorepo: `back/` (API Node + Express + MongoDB nativo), `front/` (React + Vite),
`rules/` (documentación viva del proyecto).

## Reglas de trabajo (siempre)

1. **Antes de cualquier cambio**, leer la carpeta [`rules/`](./rules/):
   - `rules/README.md` — índice y convenciones
   - `rules/estructura.md` — capas y organización de `back/` y `front/`
   - `rules/diseno.md` — tokens CSS, patrón de tablas (`ranking-*`), navegación
   - `rules/componentes.md` — catálogo de componentes/hooks/contexts reutilizables
   - `rules/logica.md` — modelo de datos Mongo y reglas de negocio
   - `rules/features/` — detalle por feature
2. **Antes de crear un componente nuevo**, revisar `rules/componentes.md` por si
   ya existe algo reutilizable.
3. **Después de cada cambio**, actualizar `rules/`:
   - agregar/editar el doc de la feature en `rules/features/`
   - anotar la entrada en `rules/registro-de-cambios.md`
   - si se creó un componente/hook/context nuevo, sumarlo a `rules/componentes.md`
   - si cambió diseño / estructura / lógica transversal, actualizar ese doc
4. **Commits en español**, imperativo corto. Terminar con la línea de
   `Co-Authored-By` que indique la sesión.
5. **Git**: usar la cuenta vinculada a la carpeta. **No commitear ni pushear
   directo a `main`** — hay más de una persona trabajando en paralelo, cada
   una en su propia rama personal (una rama fija por persona, no una nueva
   por feature). Ramas en uso actualmente: `leandro` (Leandro), `julieta`
   (Julieta). Si trabajás
   en este repo y todavía no tenés tu rama, creá la tuya con otro nombre
   antes de tu primer commit (`git checkout -b <tu-rama>` y sumate a esta
   lista).
   - Al empezar, verificar rama actual con `git branch --show-current`; si
     es `main` (o la de otra persona), cambiar a la propia con
     `git checkout <tu-rama>`.
   - Por cada cambio: commit en `<tu-rama>` → `git push origin <tu-rama>` →
     `git checkout main && git pull && git merge <tu-rama> && git push origin main`
     → `git checkout <tu-rama> && git merge main` → seguir trabajando ahí.
     El push a `main` es lo que dispara el deploy (front en Vercel, API en
     Railway), así que recién ahí queda publicado.
   - El `pull`/`merge` de `main` antes de mergear tu rama trae lo que haya
     subido la otra persona; el `merge main` final (al volver a tu rama)
     evita que se desactualice si la otra persona mergeó algo mientras
     tanto. Si hay conflicto en cualquiera de los dos merges, resolverlo a
     mano (no descartar cambios ajenos con `--ours`/checkout).
6. Reutilizar componentes y clases CSS existentes antes de crear nuevos
   (armonía de diseño).

## Comandos

- Front: `cd front && npm run build` (verificar que compila antes de commitear)
- Back: `cd back && node --check <archivo>` para chequear sintaxis
