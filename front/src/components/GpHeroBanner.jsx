import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNextRace } from "../hooks/useNextRace";
import { useModalPhase } from "../hooks/useModalPhase";
import { useEscapeKey } from "../hooks/useEscapeKey";
import racesServices from "../services/races.services";
import practiceSessionsServices from "../services/practiceSessions.services";
import predictionsServices from "../services/predictions.services";
import { formatRaceDate, getFlagEmoji } from "../utils/helpers";
import { getImageUrl } from "../utils/cloudinary";
import { buildSchedule, formatSessionTime } from "../utils/schedule";
import "../assets/styles/gpHeroBanner.css";

/**
 * Banner de próxima carrera con foto de fondo por GP — reemplaza a
 * NextRaceCTA.jsx en Home (`variant="home"`, default) Y en la pantalla de
 * Predicciones (`variant="predictions"`, montado en App.jsx igual que Home,
 * fuera de Predictions.jsx — ver el ternario de banners ahí). En el resto
 * de páginas del sitio sigue NextRaceCTA sin cambios. Diseñado y probado en
 * el laboratorio (front/src/lab/sections/GpHeroPrototype.jsx) con datos
 * mock a lo largo de varias rondas de feedback — este componente es ese
 * mismo diseño ya conectado a datos reales, ver
 * rules/features/banner-proxima-carrera-con-foto.md para el mapeo completo
 * mock→real.
 *
 * `userId`: solo lo usa variant="predictions", para resolver si el usuario
 * ya cargó su predicción de esta carrera (status-saved/status-missing). Se
 * pasa desde App.jsx (que ya lo tiene del auth) en vez de pedir el perfil
 * acá de nuevo — Predictions.jsx hace su propio fetch completo de la
 * predicción (la necesita para precargar el formulario); acá solo
 * necesitamos saber si existe o no.
 */
function GpHeroBanner({ variant = "home", userId = null }) {
  const { race, countryName, timeLeft, status } = useNextRace();
  const [sessions, setSessions] = useState([]);
  const [practices, setPractices] = useState([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [zoneMode, setZoneMode] = useState("mine");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [hasPrediction, setHasPrediction] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // findCurrentOrNext() devuelve UNA sola sesión (la más próxima, ej.
  // clasificación) — no el fin de semana completo con las demás sesiones
  // (clasificación + carrera, y sprint si aplica). Para eso hace falta
  // findByCircuitAndYear, que SÍ agrupa todas las sesiones del circuito en
  // el año (mismo endpoint que ya usa Calendar.jsx/RaceForm.jsx, con la
  // forma { race_types: [...] } en vez de { sessions: [...] } — se mapea
  // acá). Sin esto, buildSchedule() solo tenía prácticas (Practice_Sessions,
  // que sí vienen aparte) y nunca mostraba Clasificación/Carrera (reportado
  // con captura: la solapa solo listaba prácticas).
  useEffect(() => {
    const circuitId = race?.circuit?._id;
    if (!circuitId) {
      setSessions([]);
      return;
    }
    const year = new Date(race.date_gp_start).getFullYear();
    racesServices.findByCircuitAndYear(circuitId, year)
      .then((data) => setSessions(data?.race_types || []))
      .catch((err) => console.error("Error cargando sesiones para el banner:", err));
  }, [race?.circuit?._id, race?.date_gp_start]);

  // Las prácticas (Practice_Sessions) no vienen en findCurrentOrNext() —
  // se piden filtradas por circuito, igual que ya hace Calendar.jsx (ahí
  // filtra client-side sobre el año completo; acá, al ser un solo circuito,
  // se filtra server-side con el parámetro circuitId que ya soporta el
  // servicio).
  useEffect(() => {
    const circuitId = race?.circuit?._id;
    if (!circuitId) {
      setPractices([]);
      return;
    }
    practiceSessionsServices.findAll({ circuitId })
      .then(setPractices)
      .catch((err) => console.error("Error cargando prácticas para el banner:", err));
  }, [race?.circuit?._id]);

  // Solo variant="predictions": si el usuario ya cargó su predicción para
  // esta carrera, para elegir status-saved/status-missing en el banner
  // (mismo endpoint que usa Predictions.jsx, acá solo nos interesa si
  // existe o no, no el contenido). 404/"No existe predicción" = todavía no
  // predijo, no es un error real.
  useEffect(() => {
    if (variant !== "predictions" || !userId || !race?._id) {
      setHasPrediction(false);
      return;
    }
    predictionsServices.findPredictionByUserAndRace(userId, race._id)
      .then((prediction) => setHasPrediction(!!prediction))
      .catch((err) => {
        if (!err.message?.includes("No existe predicción")) {
          console.error("Error consultando la predicción del usuario para el banner:", err);
        }
        setHasPrediction(false);
      });
  }, [variant, userId, race?._id]);

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

  if (!race) return null;

  const circuitId = race.circuit?._id;
  const circuitZone = race.circuit?.timezone || "UTC";
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.date_race).getTime() - new Date(b.date_race).getTime()
  );
  const groups = buildSchedule(sortedSessions, practices);

  // Mismas 3 claves que el chip de sesión del calendario/historial
  // (qualy/sprint/race), para colorear igual en todo el sitio — igual que
  // NextRaceCTA.jsx.
  const sessionType = race.points_system?.type === "qualifying"
    ? "qualy"
    : (race.points_system?.type || "race");

  const bannerImg = race.circuit?.banner_img;
  const withPhoto = !!bannerImg;

  const scheduleBody = (
    <>
      <div className="cal-zone" role="group" aria-label="Zona horaria">
        <button
          type="button"
          className={zoneMode === "mine" ? "is-active" : ""}
          onClick={() => setZoneMode("mine")}
        >
          <i className="bi bi-person-fill"></i>Mi tiempo
        </button>
        <button
          type="button"
          className={zoneMode === "circuit" ? "is-active" : ""}
          onClick={() => setZoneMode("circuit")}
        >
          <i className="bi bi-geo-alt-fill"></i>Tiempo de circuito
        </button>
      </div>

      {groups.map((g) => (
        <div className="cal-card__group" key={g.key}>
          <div className="cal-card__group-title">
            <i className={`bi ${g.icon}`}></i>{g.title}
          </div>
          {g.items.map((it) => {
            const t = formatSessionTime(it.iso, zoneMode === "mine" ? "local" : circuitZone);
            const isPast = new Date(it.iso) <= new Date();
            return (
              <div className={`cal-session ${isPast ? "is-past" : ""}`} key={it.id}>
                <div className="cal-session__date">
                  <span className="cal-session__dow">{t.dow}</span>
                  <span className="cal-session__dnum">{t.day}</span>
                </div>
                <span className="cal-session__sep" aria-hidden="true"></span>
                <div className="cal-session__main">
                  <span className="cal-session__name">{it.label}</span>
                  <span className="cal-session__time">
                    <i className="bi bi-clock"></i>{t.time}
                  </span>
                </div>
                <div className="cal-session__end">
                  {isPast && (
                    <span className="cal-session__status-badge" title="Sesión finalizada">
                      <i className="bi bi-check2"></i>
                    </span>
                  )}
                  <span className={`cal-session__dur ${it.race ? "is-race" : it.label === "Sprint" ? "is-sprint" : ""}`}>
                    {it.dur}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );

  return (
    <div className={`gp-hero-banner ${scheduleOpen ? "is-open" : ""}`}>
      <div className={`gp-hero-banner__hero ${withPhoto ? "" : "gp-hero-banner--fallback"}`}>
        <div className="gp-hero-banner__bg">
          {withPhoto && <img src={getImageUrl(bannerImg, 1600)} alt="" />}
        </div>
        <div className="gp-hero-banner__overlay"></div>

        <div className="gp-hero-banner__topbar">
          {/* Pedido: "poner el mismo container que tiene los botones del
              nav o contenido... para que no se vayan tanto a los costados"
              — se suma la clase real .container (Bootstrap, la misma que
              usa Nav.jsx y NextRaceCTA.jsx: "nr-cta__container container")
              en vez del padding en px inventado que tenía este banner. */}
          <div className="nr-cta__container container">
            <div className="nr-cta__info">
              <div className="nr-cta__country">
                <span className="emoji-flag nr-cta__flag">
                  {getFlagEmoji(race.circuit?.country || race.id_circuit?.country)}
                </span>
                <span className="nr-cta__country-name">{countryName.toUpperCase()}</span>
                <span className="nr-cta__date">
                  {formatRaceDate(race.date_gp_start, race.date_gp_end, race.circuit?.timezone).toUpperCase()}
                </span>
              </div>
              <div className="nr-cta__meta">
                <span className={`nr-cta__round nr-cta__round--${sessionType}`}>{race.points_system?.type?.toUpperCase() || "RACE"}</span>
              </div>
            </div>

            <div className="nr-cta__countdown" style={{ position: "relative" }}>
              <div className="nr-cta__time">
                <span className="nr-cta__time-value">{timeLeft.days}</span>
                <span className="nr-cta__time-label">DÍAS</span>
              </div>
              <div className="nr-cta__time">
                <span className="nr-cta__time-value">{timeLeft.hours}</span>
                <span className="nr-cta__time-label">HS.</span>
              </div>
              <div className="nr-cta__time">
                <span className="nr-cta__time-value">{timeLeft.minutes}</span>
                <span className="nr-cta__time-label">MIN.</span>
              </div>
              <div className="nr-cta__time">
                <span className="nr-cta__time-value">{timeLeft.seconds}</span>
                <span className="nr-cta__time-label">SEG.</span>
              </div>

              <button
                type="button"
                className="gp-hero-banner__schedule-toggle"
                onClick={() => setScheduleOpen((v) => !v)}
                aria-expanded={scheduleOpen}
                aria-label={scheduleOpen ? "Ocultar horarios" : "Ver horarios del fin de semana"}
              >
                <i className={`bi ${scheduleOpen ? "bi-chevron-up" : "bi-calendar-week"} gp-hero-banner__schedule-chevron`}></i>
                <span>Horarios</span>
              </button>

              {!isMobile && (
                <div className="gp-hero-banner__schedule-dropdown">
                  <div className="gp-hero-banner__schedule-inner">
                    {scheduleBody}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="gp-hero-banner__content">
          {variant === "predictions" ? (
            // Diseñado y aprobado en el laboratorio (GpHeroPrototype.jsx,
            // variant="predictions"). Se saca de acá país/bandera/fecha/tag
            // de ronda — ya están arriba, en el topbar (el mismo de
            // siempre, sin tocar) — y se deja solo lo específico de esta
            // pantalla: título, el countdown "tiempo restante para
            // predecir" (mismas condiciones que tenía Predictions.jsx:
            // oculto en pre-window, visible mientras la carrera no esté
            // Finalizado) y el estado real de la predicción del usuario
            // (hasPrediction, ver el effect arriba).
            <>
              <h1 className="gp-hero-banner__title">{race.circuit?.gp_name}</h1>

              {!status.isPreWindow && race.state !== "Finalizado" && (
                <div className="gp-hero-banner__predict-countdown">
                  <span className="countdown-label">Tiempo restante para predecir:</span>
                  <div className="gp-hero-banner__predict-time">
                    <div className="nr-cta__time">
                      <span className="nr-cta__time-value">{timeLeft.days}</span>
                      <span className="nr-cta__time-label">DÍAS</span>
                    </div>
                    <div className="nr-cta__time">
                      <span className="nr-cta__time-value">{timeLeft.hours}</span>
                      <span className="nr-cta__time-label">HS.</span>
                    </div>
                    <div className="nr-cta__time">
                      <span className="nr-cta__time-value">{timeLeft.minutes}</span>
                      <span className="nr-cta__time-label">MIN.</span>
                    </div>
                    <div className="nr-cta__time">
                      <span className="nr-cta__time-value">{timeLeft.seconds}</span>
                      <span className="nr-cta__time-label">SEG.</span>
                    </div>
                  </div>
                </div>
              )}

              {!status.isPreWindow && !status.isClosed && (
                <div className={`prediction-status-banner ${hasPrediction ? "status-saved" : "status-missing"}`}>
                  <span>
                    {hasPrediction
                      ? "✅ Tu predicción ya está guardada, pero podés editarla antes de que el contador llegue a 0."
                      : "💡 Todavía no realizaste tu predicción."}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <span className="gp-hero-banner__eyebrow">
                {status.isInProgress ? "Carrera en curso" : "Próxima carrera"}
              </span>
              <h2 className="gp-hero-banner__title">{race.circuit?.gp_name}</h2>

              <div className="gp-hero-banner__actions">
                {status.isInProgress ? (
                  <span className="gp-hero-banner__cta gp-hero-banner__cta--live">
                    <span className="live-indicator"></span> En curso
                  </span>
                ) : (
                  <Link to="/predictions" className="gp-hero-banner__cta">
                    Predecir ahora
                  </Link>
                )}
                {circuitId && (
                  <Link to={`/circuits/${circuitId}`} className="gp-hero-banner__secondary-link">
                    Ver circuito
                  </Link>
                )}
              </div>
            </>
          )}
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
                <p className="gp-hero-banner__drawer-title">{race.circuit?.gp_name}</p>
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

export default GpHeroBanner;
