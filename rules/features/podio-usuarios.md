# Podio de usuarios

- Componente: `front/src/components/UserPodium.jsx` (estilos `assets/styles/user-podium.css`).
- Usado en `pages/Ranking.jsx` (global y por GP) y `pages/Home.jsx`.
- Datos por puesto: `{ id, rank, firstName, lastName, country, points, img }`
  (global: `stats.points.total`; GP: `points`).
- Diseño: ilustración de fondo por puesto, puesto arriba-izquierda, foto de
  perfil y puntos en rectángulos blancos a la derecha, franja inferior
  translúcida con bandera emoji + nombre completo.
- Imágenes: `front/src/assets/podium/pos1.png`, `pos2.png`, `pos3.png`
  (se levantan con `import.meta.glob`; si faltan, fondo `--color-dark-blue`).
- Desktop ≥992px: 3 columnas, orden 2º · 1º · 3º, alturas 235/275/245px.
- `Podium.jsx` se mantiene para Standings (pilotos/constructores).
