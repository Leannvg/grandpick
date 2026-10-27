import { COLOR_TOKENS, OTHER_TOKENS } from "../data/tokens.js";

function TokensSection() {
  return (
    <div>
      <h1 className="lab-section-title">Tokens</h1>
      <p className="lab-section-desc">
        Colores y valores base definidos en <code>assets/styles/globals.css</code>{" "}
        (<code>:root</code>). Fuente de verdad documentada en{" "}
        <code>rules/diseno.md</code> — si cambia ahí, actualizar también esta
        lista.
      </p>

      <div className="lab-block">
        <h2 className="lab-block-title">Colores</h2>
        <div className="lab-swatch-grid">
          {COLOR_TOKENS.map((t) => (
            <div className="lab-swatch" key={t.name}>
              <div className="lab-swatch-color" style={{ background: t.value }}></div>
              <div className="lab-swatch-body">
                <code className="lab-swatch-name">{t.name}</code>
                <code className="lab-swatch-value">{t.value}</code>
                <p className="lab-swatch-use">{t.use}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Otros</h2>
        <div className="lab-token-list">
          {OTHER_TOKENS.map((t) => (
            <div className="lab-token-row" key={t.name}>
              <code>{t.name}</code>
              <code>{t.value}</code>
              <span>{t.use}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TokensSection;
