# Rules · GrandPick

Carpeta de documentación viva del proyecto. Acá se registra de forma ordenada
**todo lo que se va construyendo**: decisiones de diseño, estructura, lógica de
negocio y el historial de cambios.

> Objetivo: que cualquiera (o cualquier IA) que retome el proyecto entienda el
> *por qué* de las cosas sin tener que reconstruirlo leyendo todo el código.

## Índice

| Archivo | Contenido |
|---|---|
| [estructura.md](./estructura.md) | Organización de carpetas de `back/` y `front/`, capas y convenciones. |
| [diseno.md](./diseno.md) | Sistema de diseño: tokens CSS, patrón de tablas, navegación. |
| [logica.md](./logica.md) | Modelo de datos (MongoDB) y reglas de negocio (puntos, carreras, etc.). |
| [registro-de-cambios.md](./registro-de-cambios.md) | Changelog cronológico de features y ajustes. |
| [features/](./features/) | Un documento por feature con el detalle de implementación. |

## Convenciones del repositorio

- **Idioma**: código y comentarios en español; nombres de colecciones Mongo en
  inglés y con `PascalCase` (`Drivers`, `Races`, `Points_System`).
- **Commits**: mensajes en español, en modo imperativo corto
  (ej: `agregar tabla de clasificación de pilotos`).
- **Git**: se usa la cuenta vinculada a esta carpeta (`Leandro Vedia`). Todos los
  cambios se pushean a `main` para desplegar.
- **Cada cambio** que se haga se documenta acá antes o junto con el commit.
