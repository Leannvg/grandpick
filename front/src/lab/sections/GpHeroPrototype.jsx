import { useState } from "react";
import "./gpHero.css";
import australiaPhoto from "../assets/australia.jpg";

// Datos mock — esto NO pega contra el backend real, es solo para evaluar el
// diseño. En la implementación real vendría de race.circuit.gp_name,
// race.circuit.banner_img (campo nuevo a crear), etc.
const MOCK_SCHEDULE = [
  { group: "Prácticas", icon: "bi-stopwatch", items: [
    { label: "Práctica 1", dow: "VIE", day: "06", time: "12:30", dur: "60 MIN." },
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

  return (
    <div className={`gp-hero-proto ${scheduleOpen ? "is-open" : ""}`}>
      <div className={`gp-hero-proto__hero ${withPhoto ? "" : "gp-hero-proto--fallback"}`}>
        <div className="gp-hero-proto__bg">
          {withPhoto && <img src={australiaPhoto} alt="" />}
        </div>
        <div className="gp-hero-proto__overlay"></div>

        {/* Pedido: la barra de datos (circuito, sesión, fecha) y el contador
            pasan a ser transparentes sobre la foto, en vez del bloque
            centrado — mismo contenido/orden que ya usa NextRaceCTA.jsx hoy
            (bandera + país + fecha con el guión bajo, pastilla de sesión a
            la izquierda; contador a la derecha), solo que acá flota sobre
            la foto en vez de tener fondo sólido azul. */}
        <div className="gp-hero-proto__topbar">
          <div className="gp-hero-proto__info">
            <div className="gp-hero-proto__top">
              <span className="gp-hero-proto__flag emoji-flag">🇦🇺</span>
              <span>AUSTRALIA</span>
              <span>06–08 NOVIEMBRE</span>
            </div>
            <span className="gp-hero-proto__round">QUALIFYING</span>
          </div>

          <div className="gp-hero-proto__countdown">
            <div className="gp-hero-proto__time">
              <span className="gp-hero-proto__time-value">03</span>
              <span className="gp-hero-proto__time-label">DÍAS</span>
            </div>
            <div className="gp-hero-proto__time">
              <span className="gp-hero-proto__time-value">15</span>
              <span className="gp-hero-proto__time-label">HS.</span>
            </div>
            <div className="gp-hero-proto__time">
              <span className="gp-hero-proto__time-value">22</span>
              <span className="gp-hero-proto__time-label">MIN.</span>
            </div>
            <div className="gp-hero-proto__time">
              <span className="gp-hero-proto__time-value">41</span>
              <span className="gp-hero-proto__time-label">SEG.</span>
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
            </button>

            <div className="gp-hero-proto__schedule-dropdown">
              <div className="gp-hero-proto__schedule-inner">
                <div className="gp-hero-proto__zone-compact" role="group" aria-label="Zona horaria">
                  <button type="button" className="is-active">
                    <i className="bi bi-person-fill"></i>Mi tiempo
                  </button>
                  <button type="button">
                    <i className="bi bi-geo-alt-fill"></i>Tiempo de circuito
                  </button>
                </div>

                {MOCK_SCHEDULE.map((g) => (
                  <div className="gp-hero-proto__sched-group" key={g.group}>
                    <div className="gp-hero-proto__sched-group-title">
                      <i className={`bi ${g.icon}`}></i>{g.group}
                    </div>
                    {g.items.map((it) => (
                      <div className="gp-hero-proto__sched-row" key={it.label}>
                        <span className="gp-hero-proto__sched-label">{it.label}</span>
                        <span className={`gp-hero-proto__sched-time ${it.isRace ? "is-race" : ""}`}>
                          {it.dow} {it.day} · {it.time}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
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
    </div>
  );
}

export default GpHeroPrototype;
