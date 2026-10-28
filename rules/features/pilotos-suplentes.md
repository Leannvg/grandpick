# Pilotos suplentes (en `/drivers`)

Sección secundaria al final de la pantalla de Pilotos: línea divisoria + header
chico ("Reservas" / `PILOTOS SUPLENTES`) + grilla de cards.

## Diseño

- Card = `DriverCardMobile` sin número y con imagen genérica
  (`front/src/assets/icons/suplente.png`, igual para todos). Datos mostrados:
  nombre completo, escudería (logo), nacionalidad y trigrama.
- Header de la sección con el estilo estándar de títulos (`page-header` + `section-title`).
- Los pilotos titulares también usan esta misma card (`DriverCardMobile`) en desktop; el diseño horizontal anterior (`DriverCardDesktop`) quedó comentado en `Drivers.jsx`.
- Tags de la card del mismo ancho (el del más ancho) y contenido centrado: regla general de `.driver-tags-vertical` (compartida con las cards de titulares).
- Estilos al final de `assets/styles/components.css` (`.reserve-*`).

## Estado de los datos

Datos reales: `pages/Drivers.jsx` separa titulares de suplentes según el
campo `role` del piloto (`"titular"` vs. cualquier otro valor, incluido sin
asignar todavía) — asignado desde la pantalla "Asignaciones" del admin, ver
`rules/logica.md` y `rules/componentes.md` (`Assignments`). Si no hay
suplentes (ningún piloto activo con `role` distinto de `"titular"`), la
sección no se renderiza.

## Archivos

- `components/drivers/ReserveDriverCard.jsx`
- `components/drivers/ReserveDriversSection.jsx` (prop `drivers`)
- `pages/Drivers.jsx`
