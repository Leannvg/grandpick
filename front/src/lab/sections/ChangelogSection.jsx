import { DESIGN_CHANGELOG } from "../data/changelog.js";

function ChangelogSection() {
  return (
    <div>
      <h1 className="lab-section-title">Cambios</h1>
      <p className="lab-section-desc">
        Bitácora corta de la limpieza de consistencia visual (botones,
        colores, tablas, espaciados). No reemplaza{" "}
        <code>rules/registro-de-cambios.md</code> (ese registra todo el
        proyecto) — es el resumen de esta cruzada puntual, para que Leandro y
        Julieta arranquen con el mismo contexto. <strong>Regla:</strong> cada
        cambio de diseño/consistencia visual suma una entrada nueva en{" "}
        <code>src/lab/data/changelog.js</code>, arriba de todo.
      </p>

      <div className="lab-changelog">
        {DESIGN_CHANGELOG.map((entry, i) => (
          <div className="lab-changelog-entry" key={i}>
            <div className="lab-changelog-date">{entry.date}</div>
            <div className="lab-changelog-body">
              <h2 className="lab-changelog-title">{entry.title}</h2>
              <p className="lab-changelog-summary">{entry.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChangelogSection;
