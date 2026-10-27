import { LIBRARIES } from "../data/libraries.js";

function LibrariesSection() {
  return (
    <div>
      <h1 className="lab-section-title">Librerías</h1>
      <p className="lab-section-desc">
        Espejo de <code>front/package.json</code> con qué se usa para qué.
        Antes de sumar una librería nueva para algo que ya cubre una de
        estas, reutilizarla.
      </p>

      <table className="lab-table">
        <thead>
          <tr>
            <th>Librería</th>
            <th>Versión</th>
            <th>Para qué se usa</th>
          </tr>
        </thead>
        <tbody>
          {LIBRARIES.map((lib) => (
            <tr key={lib.name}>
              <td><code>{lib.name}</code></td>
              <td>{lib.version}</td>
              <td>{lib.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LibrariesSection;
