import { useEffect, useRef, useState } from "react";
import { useModalPhase } from "../../hooks/useModalPhase";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import "../../assets/styles/globals.css";
import "../../assets/styles/components.css";
import "../../assets/styles/predictionHistory.css";
import "../../assets/styles/calendar.css";
import "./gpHero.css";
import australiaPhoto from "../assets/australia.jpg";

// Datos mock — esto NO pega contra el backend real, es solo para evaluar el
// diseño. En la implementación real vendría de race.circuit.gp_name,
// race.circuit.banner_img (campo nuevo a crear), etc.
// Pedido: a la solapa le faltaban datos frente a la del calendario real
// (CalendarCard.jsx) — día de semana + número, ícono de reloj, pill de
// duración, marca de sesión finalizada. isPast en Práctica 1 es solo para
// mostrar cómo se ve ese estado (en la implementación real sale de
// comparar la fecha de la sesión contra ahora, como en CalendarCard.jsx).
const MOCK_SCHEDULE = [
  { group: "Prácticas", icon: "bi-stopwatch", items: [
    { label: "Práctica 1", dow: "VIE", day: "06", time: "12:30", dur: "60 MIN.", isPast: true },
    { label: "Práctica 2", dow: "VIE", day: "06", time: "16:00", dur: "60 MIN." },
    { label: "Práctica 3", dow: "SÁB", day: "07", time: "11:30", dur: "60 MIN." },
  ]},
  { group: "Clasificación y carrera", icon: "bi-flag-fill", items: [
    { label: "Clasificación", dow: "SÁB", day: "07", time: "15:00", dur: "60 MIN.", isRace: false },
    { label: "Carrera", dow: "DOM", day: "08", time: "14:00", dur: "2 HS.", isRace: true },
  ]},
];

/**
 * PROTOTIPO — banner de próxima carrera con foto de fondo por GP.
 * Vive solo en el laboratorio (front/lab.html), no se importa desde
 * ningún archivo de producción. Reemplazaría eventualmente a
 * front/src/components/NextRaceCTA.jsx una vez aprobado el diseño.
 */
function GpHeroPrototype({ withPhoto = true }) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  // Pedido: en mobile, los horarios se abren en la misma "bandeja" (bottom
  // sheet) que ya usa el resto del sitio (comparación de predicciones,
  // historial), no en un desplegable pegado al botón — reusa el mismo
  // cascarón (.history-drawer-overlay / .drawer-handle / .gp-compare-drawer*
  // de predictionHistory.css + las animaciones --css de components.css) y
  // el mismo patrón de useModalPhase/useEscapeKey/drag-to-close que
  // FloatingPredictionCompare.jsx. En desktop sigue el desplegable angosto
  // de siempre, pegado al contador.
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEscapeKey(scheduleOpen, () => setScheduleOpen(false));
  const phase = useModalPhase(scheduleOpen);

  useEffect(() => {
    if (scheduleOpen && isMobile) {
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add("body-scroll-lock");
    } else {
      const lockedScrollY = document.body.style.top;
      document.body.classList.remove("body-scroll-lock");
      document.body.style.top = "";
      if (lockedScrollY) window.scrollTo(0, -parseInt(lockedScrollY, 10));
    }
    return () => {
      document.body.classList.remove("body-scroll-lock");
      document.body.style.top = "";
    };
  }, [scheduleOpen, isMobile]);

  // Deslizar para cerrar la bandeja (mismo gesto que FloatingPredictionCompare.jsx)
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef(0);

  const onDragStart = (e) => {
    dragStartRef.current = e.clientY;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove = (e) => {
    if (!dragging) return;
    setDragY(Math.max(0, e.clientY - dragStartRef.current));
  };
  const onDragEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragY > 100) setScheduleOpen(false);
    else setDragY(0);
  };

  // Pedido: "hacerlo igual al del calendario" — en vez de aproximar el
  // contenido con clases propias (como se había hecho antes con la barra
  // de info), acá se reusa el markup y las clases reales de
  // CalendarCard.jsx (.cal-zone, .cal-card__group*, .cal-session*) tal
  // cual, de calendar.css. Mismo patrón ya aplicado a la barra de
  // info/contador: pixel-igual al real en vez de una aproximación.
  const scheduleBody = (
    <>
      <div className="cal-zone" role="group" aria-label="Zona horaria">
        <button type="button" className="is-active">
          <i className="bi bi-person-fill"></i>Mi tiempo
        </button>
        <button type="button">
          <i className="bi bi-geo-alt-fill"></i>Tiempo de circuito
        </button>
      </div>

      {MOCK_SCHEDULE.map((g) => (
        <div className="cal-card__group" key={g.group}>
          <div className="cal-card__group-title">
            <i className={`bi ${g.icon}`}></i>{g.group}
          </div>
          {g.items.map((it) => (
            <div className={`cal-session ${it.isPast ? "is-past" : ""}`} key={it.label}>
              <div className="cal-session__date">
                <span className="cal-session__dow">{it.dow}</span>
                <span className="cal-session__dnum">{it.day}</span>
              </div>
              <span className="cal-session__sep" aria-hidden="true"></span>
              <div className="cal-session__main">
                <span className="cal-session__name">{it.label}</span>
                <span className="cal-session__time">
                  <i className="bi bi-clock"></i>{it.time}
                </span>
              </div>
              <div className="cal-session__end">
                {it.isPast && (
                  <span className="cal-session__status-badge" title="Sesión finalizada">
                    <i className="bi bi-check2"></i>
                  </span>
                )}
                <span className={`cal-session__dur ${it.isRace ? "is-race" : it.label === "Sprint" ? "is-sprint" : ""}`}>
                  {it.dur}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );

  return (
    <div className={`gp-hero-proto ${scheduleOpen ? "is-open" : ""}`}>
      <div className={`gp-hero-proto__hero ${withPhoto ? "" : "gp-hero-proto--fallback"}`}>
        <div className="gp-hero-proto__bg">
          {withPhoto && <img src={australiaPhoto} alt="" />}
        </div>
        <div className="gp-hero-proto__overlay"></div>

        {/* Pedido: la barra de datos (circuito, sesión, fecha) y el contador
            tienen que ser LA MISMA que ya está en producción
            (NextRaceCTA.jsx), solo que transparente — por eso acá se
            reusan las clases reales (.nr-cta__*, de globals.css) en vez de
            una aproximación hecha a mano. .gp-hero-proto__topbar es lo
            único propio del prototipo: solo posiciona todo flotando arriba
            de la foto (position:absolute) en vez de .nr-cta (que tiene
            background sólido) — al no usar esa clase, el fondo ya queda
            transparente sin tocar nada más. */}
        <div className="gp-hero-proto__topbar">
          <div className="nr-cta__container">
            <div className="nr-cta__info">
              <div className="nr-cta__country">
                <span className="emoji-flag nr-cta__flag">🇦🇺</span>
                <span className="nr-cta__country-name">AUSTRALIA</span>
                <span className="nr-cta__date">06–08 NOVIEMBRE</span>
              </div>
              <div className="nr-cta__meta">
                <span className="nr-cta__round nr-cta__round--qualy">QUALIFYING</span>
              </div>
            </div>

              <div className="nr-cta__countdown" style={{ position: "relative" }}>
                <div className="nr-cta__time">
                  <span className="nr-cta__time-value">03</span>
                  <span className="nr-cta__time-label">DÍAS</span>
                </div>
                <div className="nr-cta__time">
                  <span className="nr-cta__time-value">15</span>
                  <span className="nr-cta__time-label">HS.</span>
                </div>
                <div className="nr-cta__time">
                  <span className="nr-cta__time-value">22</span>
                  <span className="nr-cta__time-label">MIN.</span>
                </div>
                <div className="nr-cta__time">
                  <span className="nr-cta__time-value">41</span>
                  <span className="nr-cta__time-label">SEG.</span>
                </div>

                {/* El desplegable de horarios sigue pegado al contador, tomando
                    su mismo ancho. Ícono de calendario en vez de flecha sola —
                    la flecha no decía qué información iba a aparecer; al
                    abrirlo pasa a una flecha hacia arriba (cerrar). */}
                <button
                  type="button"
                  className="gp-hero-proto__schedule-toggle"
                  onClick={() => setScheduleOpen((v) => !v)}
                  aria-expanded={scheduleOpen}
                  aria-label={scheduleOpen ? "Ocultar horarios" : "Ver horarios del fin de semana"}
                >
                  <i className={`bi ${scheduleOpen ? "bi-chevron-up" : "bi-calendar-week"} gp-hero-proto__schedule-chevron`}></i>
                  <span>Horarios</span>
                </button>

                {!isMobile && (
                  <div className="gp-hero-proto__schedule-dropdown">
                    <div className="gp-hero-proto__schedule-inner">
                      {scheduleBody}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        <div className="gp-hero-proto__content">
          <h2 className="gp-hero-proto__title">Gran Premio de Australia</h2>

          <a href="#" className="gp-hero-proto__cta" onClick={(e) => e.preventDefault()}>
            Ver circuito
          </a>
        </div>
      </div>

      {isMobile && phase !== "closed" && (
        <>
          <div
            className={`history-drawer-overlay is-open gp-drawer-overlay--css ${phase === "closing" ? "is-closing" : ""}`}
            onClick={() => setScheduleOpen(false)}
          />
          <div
            className={`gp-compare-drawer gp-compare-drawer--css ${phase === "closing" ? "is-closing" : ""} ${dragging ? "is-dragging" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Horarios del fin de semana"
            style={{ transform: `translateY(${dragY}px)` }}
          >
            <div
              style={{ touchAction: "none" }}
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
            >
              <div className="drawer-handle"></div>
              <div className="gp-compare-drawer-header">
                <p className="gp-hero-proto__drawer-title">Gran Premio de Australia</p>
              </div>
            </div>

            <div className="gp-compare-drawer-body">
              {scheduleBody}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GpHeroPrototype;
