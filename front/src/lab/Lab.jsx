import { useState } from "react";
import ChangelogSection from "./sections/ChangelogSection.jsx";
import TokensSection from "./sections/TokensSection.jsx";
import IconsSection from "./sections/IconsSection.jsx";
import ComponentsSection from "./sections/ComponentsSection.jsx";
import PatternsSection from "./sections/PatternsSection.jsx";
import AnimationsSection from "./sections/AnimationsSection.jsx";
import LibrariesSection from "./sections/LibrariesSection.jsx";
import ScreensSection from "./sections/ScreensSection.jsx";

const SECTIONS = [
  { id: "changelog", label: "Cambios", icon: "bi-clock-history", Component: ChangelogSection },
  { id: "tokens", label: "Tokens", icon: "bi-palette-fill", Component: TokensSection },
  { id: "icons", label: "Iconografía", icon: "bi-stars", Component: IconsSection },
  { id: "components", label: "Componentes", icon: "bi-grid-3x3-gap-fill", Component: ComponentsSection },
  { id: "patterns", label: "Patrones de página", icon: "bi-layout-text-window", Component: PatternsSection },
  { id: "animations", label: "Animaciones", icon: "bi-magic", Component: AnimationsSection },
  { id: "libraries", label: "Librerías", icon: "bi-box-seam", Component: LibrariesSection },
  { id: "screens", label: "Pantallas", icon: "bi-display", Component: ScreensSection },
];

function Lab() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const active = SECTIONS.find((s) => s.id === activeId) || SECTIONS[0];
  const ActiveComponent = active.Component;

  return (
    <div className="lab-shell">
      <aside className="lab-sidebar">
        <div className="lab-brand">
          <span className="lab-brand-title">GRANDPICK</span>
          <span className="lab-brand-sub">Laboratorio de diseño</span>
        </div>
        <nav className="lab-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`lab-nav-item ${s.id === activeId ? "is-active" : ""}`}
              onClick={() => setActiveId(s.id)}
            >
              <i className={`bi ${s.icon}`}></i>
              {s.label}
            </button>
          ))}
        </nav>
        <p className="lab-sidebar-note">
          Solo local — no forma parte del build de producción.
        </p>
      </aside>

      <main className="lab-content">
        <ActiveComponent />
      </main>
    </div>
  );
}

export default Lab;
