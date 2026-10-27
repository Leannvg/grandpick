import "../../assets/styles/ranking.css";

function PatternsSection() {
  return (
    <div>
      <h1 className="lab-section-title">Patrones de página</h1>
      <p className="lab-section-desc">
        Combinaciones de clases ya existentes que se repiten entre pantallas.
        Documentado en detalle en <code>rules/diseno.md</code> — esta sección
        es la versión renderizada para copiar/pegar rápido.
      </p>

      <div className="lab-block">
        <h2 className="lab-block-title">Header de página</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          <code>.page-wrapper &gt; .page-section &gt; .page-header</code> —
          usado en todas las páginas públicas.
        </p>
        <div className="lab-specimen">
          <div className="lab-specimen-stage lab-specimen-stage--dark">
            <header className="page-header text-center">
              <p className="section-label">Eyebrow</p>
              <h1 className="section-title">TÍTULO</h1>
              <p className="section-subtitle">Subtítulo descriptivo</p>
            </header>
          </div>
        </div>
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Buscador estándar (ranking-input-group)</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Label gris + input que filtra en vivo, <strong>sin botón</strong>{" "}
          (un botón «Buscar» aparte es confuso si ya filtra solo). Usado en
          Home/Ranking/Standings, historial y el buscador del admin.
        </p>
        <div className="lab-specimen">
          <div className="lab-specimen-stage lab-specimen-stage--dark" style={{ justifyContent: "flex-start" }}>
            <div className="ranking-input-group h-38px" style={{ maxWidth: 260 }}>
              <span className="ranking-input-group-text">Buscar</span>
              <input type="text" placeholder="Buscador" />
            </div>
          </div>
        </div>
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Tabla tipo campeonato (ranking-*)</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Fuente de verdad: <code>assets/styles/ranking.css</code>. No crear
          tablas nuevas desde cero — reutilizar esta familia de clases.
        </p>
        <div className="lab-specimen">
          <div className="lab-specimen-stage lab-specimen-stage--dark" style={{ width: "100%" }}>
            <div className="ranking-card" style={{ width: "100%", maxWidth: 480 }}>
              <div className="ranking-table-container table-responsive">
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Usuario</th>
                      <th>Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="pos-cell pos-1">1</td>
                      <td>Ezequiel Arias</td>
                      <td>655</td>
                    </tr>
                    <tr>
                      <td className="pos-cell pos-2">2</td>
                      <td>Matías Arias</td>
                      <td>640</td>
                    </tr>
                    <tr>
                      <td className="pos-cell pos-3">3</td>
                      <td>Julieta Arias</td>
                      <td>612</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Formulario (gp-input-group)</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Usado en Login, Register, ForgotPassword y formularios de admin.
          Cápsula azul de label con ancho fijo (160px) + input a la
          izquierda.
        </p>
        <div className="lab-specimen">
          <div className="lab-specimen-stage lab-specimen-stage--dark">
            <div className="gp-input-group-container" style={{ width: 320 }}>
              <div className="gp-input-group">
                <label className="gp-input-label">Email</label>
                <input className="form-control" type="email" placeholder="juan@perez" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatternsSection;
