import "../assets/styles/information.css";
import "../assets/styles/legal.css";

/**
 * Shell compartido para páginas de texto legal largo (Política de Privacidad,
 * Términos y Condiciones). Reusa el layout estándar de página
 * (page-wrapper/page-section/page-header, ver rules/diseno.md) y la card +
 * tipografía de `information.css` (pensada para lectura larga, usada hoy por
 * "Cómo jugar"/"Guía de F1"/"F1 TV"). A diferencia de `InformationPage.jsx`,
 * no tiene tabs/sidebar/drawer: cada página legal es un solo documento.
 */
function LegalPageLayout({ eyebrow, title, subtitle, lastUpdated, children }) {
  return (
    <div className="legal-page page-wrapper">
      <section className="page-section container">
        <header className="page-header text-center">
          <p className="section-label">{eyebrow}</p>
          <h1 className="section-title">{title}</h1>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </header>

        <div className="info-page__content-card legal-page__card">
          {lastUpdated && (
            <p className="legal-page__updated">Última actualización: {lastUpdated}</p>
          )}
          <div className="info-section__body">{children}</div>
        </div>
      </section>
    </div>
  );
}

export default LegalPageLayout;
