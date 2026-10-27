import { ICONS_IN_USE } from "../data/icons.js";

function IconsSection() {
  return (
    <div>
      <h1 className="lab-section-title">Iconografía</h1>
      <p className="lab-section-desc">
        <strong>Bootstrap Icons</strong> (CDN, <code>bi bi-…</code>), es la
        única librería de íconos del proyecto. Regla global en{" "}
        <code>globals.css</code>: <code>.bi {"{"} line-height: 1 {"}"}</code>{" "}
        para que el glifo no quede corrido dentro de botones/círculos.
        Relevamiento manual de los {ICONS_IN_USE.length} íconos ya usados en
        el código — antes de agregar uno nuevo, revisar si ya hay uno
        parecido acá.
      </p>

      <div className="lab-icon-grid">
        {ICONS_IN_USE.map((icon) => (
          <div className="lab-icon-tile" key={icon}>
            <i className={`bi ${icon}`}></i>
            <span>{icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IconsSection;
