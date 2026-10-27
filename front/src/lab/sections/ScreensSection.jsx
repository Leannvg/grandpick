const PUBLIC_SCREENS = [
  { path: "/", label: "Home" },
  { path: "/calendar", label: "Calendario" },
  { path: "/drivers", label: "Pilotos" },
  { path: "/teams", label: "Escuderías" },
  { path: "/circuits", label: "Circuitos" },
  { path: "/standings", label: "Campeonato" },
  { path: "/ranking", label: "Ranking" },
  { path: "/how-to-play", label: "Cómo jugar" },
  { path: "/login", label: "Iniciar sesión" },
  { path: "/register", label: "Registrarse" },
];

const AUTH_SCREENS = [
  { path: "/profile", label: "Mi ficha" },
  { path: "/predictions", label: "Predecir" },
  { path: "/prediction-history", label: "Mi historial" },
];

function ScreenGrid({ screens }) {
  return (
    <div className="lab-screens-grid">
      {screens.map((s) => (
        <div className="lab-screen-card" key={s.path}>
          <div className="lab-screen-frame-wrap">
            <iframe src={s.path} title={s.label} loading="lazy" />
          </div>
          <div className="lab-screen-label">
            {s.label}
            <a href={s.path} target="_blank" rel="noreferrer">
              Abrir <i className="bi bi-box-arrow-up-right"></i>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScreensSection() {
  return (
    <div>
      <h1 className="lab-section-title">Pantallas</h1>
      <p className="lab-section-desc">
        Vista en miniatura de las pantallas reales corriendo en este mismo
        dev server (<code>iframe</code> + escala, no capturas), para
        comparar líneas de diseño de un vistazo. «Abrir» lleva a la página
        completa en una pestaña nueva.
      </p>

      <div className="lab-block">
        <h2 className="lab-block-title">Públicas</h2>
        <ScreenGrid screens={PUBLIC_SCREENS} />
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Requieren sesión iniciada</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Sin login muestran la pantalla de acceso. Iniciá sesión en una
          pestaña normal primero si querés verlas con contenido real (el
          iframe comparte cookies/localStorage con el resto del sitio en
          este mismo origen).
        </p>
        <ScreenGrid screens={AUTH_SCREENS} />
      </div>
    </div>
  );
}

export default ScreensSection;
