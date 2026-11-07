import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useModalPhase } from "../../hooks/useModalPhase";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import "../../assets/styles/globals.css";
import "../../assets/styles/components.css";
import "../../assets/styles/predictionHistory.css";
import "../../assets/styles/calendar.css";
import "../../assets/styles/predictions.css";
import "./gpHero.css";
import australiaPhoto from "../assets/australia.jpg";

// Pedido: "se ve medio mal, no parece una lluvia natural" — un
// repeating-linear-gradient es, por definición, un patrón perfectamente
// regular (franjas idénticas y parejas), no hay forma de que eso se lea
// como orgánico. La técnica real para esto es dispersar "gotas"
// individuales en posiciones al azar — animadas cayendo en diagonal.
//
// Pedido después: "se nota cuando un grupo de gotas se corta y
// desaparece y vuelve a aparecer arriba" — cada gota se dibuja DOS veces
// apiladas (una arriba de la otra, top: 0 y top: -RAIN_TILE_HEIGHT) y el
// translateY de su animación recorre EXACTAMENTE esa misma distancia —
// así, en el instante del reinicio del loop, la segunda copia ya está
// donde estaba la primera, y el corte queda invisible (truco estándar de
// "tiling" para loops continuos).
//
// Pedido después: "¿podemos hacer que caigan de manera aleatoria
// infinitamente? se nota que se reacomodan siempre al mismo lugar" — el
// primer intento agrupaba las gotas en 4 "capas" compartiendo timing
// (menos trabajo: una sola animación por capa, reusando un solo elemento
// con N copias vía box-shadow). El problema: aunque el CONJUNTO completo
// de las 4 capas juntas no coincidía nunca exacto, CADA capa por separado
// sí volvía a su patrón idéntico cada 1.1-2.3s — un intervalo corto y
// perceptible, sobre todo en la capa de gotas grandes/brillantes (la más
// vistosa). Fix real: cada gota es su PROPIO elemento con su PROPIO
// timing al azar (duración, delay, tamaño, opacidad, deriva — todo
// independiente, no agrupado en unas pocas capas compartidas). Con ~100
// gotas cada una con un timing distinto, no hay ningún subconjunto visible
// que comparta ciclo y se note repetirse. Son más elementos en el DOM que
// la técnica de box-shadow (200 contando el duplicado para el tiling),
// pero sigue siendo liviano (spans simples animados con transform, sin
// canvas ni librerías) — y es la única forma real de lograr "infinito y
// sin patrón perceptible" con CSS puro.
const RAIN_TILE_HEIGHT = 700;

function buildRainDrops(count, xRange) {
  const drops = [];
  for (let i = 0; i < count; i++) {
    // "depth" 0..1 encapsula varios atributos correlacionados a la vez
    // (una gota "cerca" es más grande, más brillante, cae más rápido;
    // una gota "lejos" es chica, tenue, lenta y un poco desenfocada) en
    // vez de sortear cada atributo sin relación con los demás — da una
    // sensación de profundidad más creíble que puro ruido.
    const depth = Math.random();
    const duration = +(2.6 - depth * 1.6).toFixed(2);
    drops.push({
      x: Math.round(xRange[0] + Math.random() * (xRange[1] - xRange[0])),
      size: Math.round(6 + depth * 14),
      opacity: (0.12 + depth * 0.55).toFixed(2),
      duration,
      delay: -(Math.random() * duration).toFixed(2),
      drift: -(15 + Math.round(Math.random() * 45)),
      blur: depth < 0.4 ? +((0.4 - depth) * 1.2).toFixed(2) : 0,
    });
  }
  return drops;
}

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

const DEFAULT_GP = {
  photo: australiaPhoto,
  flag: "🇦🇺",
  country: "AUSTRALIA",
  date: "06–08 NOVIEMBRE",
  title: "Gran Premio de Australia",
  round: { label: "QUALIFYING", type: "qualy" },
  isInProgress: false,
  // Pedido: "¿es posible agregar un efecto de lluvia al banner?... se me
  // ocurriría agregar efectos de animación según el clima". Arranca con
  // uno solo (lluvia, pedido explícito) para validar el mecanismo antes
  // de construir el resto (tormenta/sol/nublado/noche calurosa). Dato
  // 100% mock por ahora — no hay ningún campo real que diga el clima de
  // un GP; si se aprueba, ver de dónde sale ese dato en la implementación
  // real (¿campo manual en el admin? ¿una API de clima?) es aparte.
  // null | "rain" — ver .gp-hero-proto__weather* en gpHero.css.
  weather: null,
};

/**
 * PROTOTIPO — banner de próxima carrera con foto de fondo por GP.
 * Vive solo en el laboratorio (front/lab.html), no se importa desde
 * ningún archivo de producción. Reemplazaría eventualmente a
 * front/src/components/NextRaceCTA.jsx una vez aprobado el diseño.
 *
 * `gp` parametriza foto/bandera/país/fecha/título — pedido para poder
 * previsualizar varias fotos reales (Brasil, Las Vegas, Qatar, Yas Marina)
 * sin duplicar el componente entero. Default = Australia (el único caso
 * que había antes de parametrizarlo).
 *
 * `variant`: "home" (default, igual que siempre) | "predictions" — pedido
 * para probar este mismo banner (foto + topbar flotante) como cabecera de
 * Predictions.jsx, que hoy tiene su propio header de texto plano sobre
 * fondo sólido (section-title/qualy-label/prediction-status-banner, de
 * predictions.css), sin foto y con la barra de arriba sólida (.nr-cta real)
 * en vez de flotante como en Home. Reusa TODO el resto del componente
 * (foto, topbar transparente, desplegable/bandeja de horarios) — solo
 * cambia el contenido de .gp-hero-proto__content.
 */
function GpHeroPrototype({ withPhoto = true, gp = DEFAULT_GP, variant = "home" }) {
  // Cada gota con su propio timing al azar (ver buildRainDrops arriba).
  // Se arma UNA vez por instancia (useMemo), no en cada render — si se
  // regenerara en cada render, las gotas "saltarían" a posiciones nuevas
  // cada vez que algo del banner fuerza un re-render (ej. abrir Horarios).
  const rainDrops = useMemo(() => buildRainDrops(100, [-50, 1500]), []);

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
          {withPhoto && <img src={gp.photo} alt="" />}
        </div>
        <div className="gp-hero-proto__overlay"></div>

        {/* Pedido: efecto de clima animado sobre la foto, arrancando con
            lluvia nomás (el resto — tormenta/sol/nublado/noche calurosa —
            queda para después de validar este). Capa propia encima del
            degradado y debajo del topbar/contenido (aria-hidden: puro
            efecto visual, no aporta información).
            Cada gota (rainDrops, ver buildRainDrops arriba) es su propio
            elemento con su propio timing al azar, y se dibuja DOS veces
            apiladas (top: 0 y top: -RAIN_TILE_HEIGHT, mismo x/tamaño/
            opacidad/duración/delay en ambas copias) — con la animación
            cayendo exactamente RAIN_TILE_HEIGHT px, al reiniciar el loop
            de ESA gota la segunda copia ya quedó donde estaba la primera,
            invisible el corte. Que cada gota tenga su propio timing (no
            unas pocas "capas" compartidas) es lo que evita que se note
            un grupo repitiéndose siempre igual (reportado: "se nota
            cuando se reinicia porque se reacomodan siempre al mismo
            lugar" — con capas compartidas, esa capa entera volvía a su
            patrón exacto cada ciclo, un intervalo corto y perceptible). */}
        {gp.weather === "rain" && (
          <div className="gp-hero-proto__weather gp-hero-proto__weather--rain" aria-hidden="true">
            {rainDrops.map((drop, i) => {
              const dropStyle = {
                left: drop.x,
                width: 1,
                height: drop.size,
                background: `rgba(255,255,255,${drop.opacity})`,
                animationDuration: `${drop.duration}s`,
                animationDelay: `${drop.delay}s`,
                "--rain-drift": `${drop.drift}px`,
                filter: drop.blur ? `blur(${drop.blur}px)` : undefined,
              };
              return (
                <Fragment key={i}>
                  <span className="gp-hero-proto__rain-drop" style={{ ...dropStyle, top: 0 }}></span>
                  <span className="gp-hero-proto__rain-drop" style={{ ...dropStyle, top: -RAIN_TILE_HEIGHT }}></span>
                </Fragment>
              );
            })}
          </div>
        )}

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
          <div className="nr-cta__container container">
            <div className="nr-cta__info">
              <div className="nr-cta__country">
                <span className="emoji-flag nr-cta__flag">{gp.flag}</span>
                <span className="nr-cta__country-name">{gp.country}</span>
                <span className="nr-cta__date">{gp.date}</span>
              </div>
              <div className="nr-cta__meta">
                <span className={`nr-cta__round nr-cta__round--${gp.round.type}`}>{gp.round.label}</span>
                {/* Pedido: "el 'en curso' de arriba ya no debería estar" —
                    mismo criterio que con "Predecir ahora": dentro de ESTE
                    hero quedaba duplicado contra la marca "En curso" del CTA
                    grande de abajo (ver gp-hero-proto__cta--live). Se saca
                    de acá. NextRaceCTA.jsx real, sin tocar, sigue mostrando
                    su propio tag "EN CURSO" (.nr-cta__session-tag +
                    .live-indicator) en el resto de páginas — ahí sí hace
                    falta, porque no hay ningún CTA grande que ya lo diga. */}
                {/* Pedido: "¿no quedan duplicados?" — sí, dentro de ESTE hero
                    se leía como el mismo botón repetido dos veces muy cerca.
                    Se saca de acá (vuelve a quedar solo el chip QUALIFYING).
                    La duda de la vuelta anterior (que el resto de páginas se
                    quede sin esta CTA) no aplica: ese riesgo era sobre
                    NextRaceCTA.jsx, el archivo real — y este hero no lo toca
                    ni lo reemplaza ahí, solo lo reemplazaría en Home (es
                    prototipo, vive solo en el laboratorio). NextRaceCTA.jsx
                    sigue mostrando "Predecir ahora" en el resto del sitio tal
                    cual está hoy, intacto. Acá en Home el botón grande de
                    abajo (bajo el título) ya cubre esa acción. */}
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
          {variant === "predictions" ? (
            <>
              {/* Pedido: "adaptar la barra de contador como en la home" ya
                  está cubierto arriba (mismo .gp-hero-proto__topbar
                  transparente/flotante que usa "home"). Acá abajo: mismo
                  contenido real que tiene hoy Predictions.jsx, pero
                  flotando sobre la foto en vez de fondo sólido, "más
                  lucido" como se pidió.
                  Pedido después: "información repetida — el tag de RACE,
                  el contador, la fecha" se veían tanto acá como en la
                  barra de arriba. Se saca de acá país/bandera, fecha y el
                  chip de ronda (ya están arriba, en el topbar — no se
                  toca ESE, es el que pidieron igual a Home) y se deja solo
                  lo específico de esta pantalla: título, el countdown
                  "tiempo restante para predecir" (el protagonista, pedido
                  explícito: "queda bien porque muestra en primera plana
                  el tiempo que queda") y el status real de la predicción
                  (.prediction-status-banner/.status-missing/.status-saved,
                  de predictions.css, sin tocar). */}
              <h1 className="gp-hero-proto__title">{gp.title}</h1>

              <div className="gp-hero-proto__predict-countdown">
                <span className="countdown-label">Tiempo restante para predecir:</span>
                <div className="gp-hero-proto__predict-time">
                  <div className="nr-cta__time">
                    <span className="nr-cta__time-value">00</span>
                    <span className="nr-cta__time-label">DÍAS</span>
                  </div>
                  <div className="nr-cta__time">
                    <span className="nr-cta__time-value">20</span>
                    <span className="nr-cta__time-label">HS.</span>
                  </div>
                  <div className="nr-cta__time">
                    <span className="nr-cta__time-value">27</span>
                    <span className="nr-cta__time-label">MIN.</span>
                  </div>
                  <div className="nr-cta__time">
                    <span className="nr-cta__time-value">55</span>
                    <span className="nr-cta__time-label">SEG.</span>
                  </div>
                </div>
              </div>

              <div className="prediction-status-banner status-missing">
                <span>💡 Todavía no realizaste tu predicción.</span>
              </div>
            </>
          ) : (
            <>
              {/* Pedido: no se entendía por qué estaba ahí ese GP — la barra de
                  arriba (país/fecha) ya lo sugiere, pero el título grande solo
                  repite el nombre sin dar ese contexto. Etiqueta chica arriba,
                  propia del prototipo (no existe en NextRaceCTA.jsx real, que no
                  tiene título — ver gp-hero-proto__eyebrow en gpHero.css).
                  Con isInProgress (ver EN CURSO más arriba) cambia el texto:
                  "Próxima carrera" quedaba contradictorio con un GP que ya
                  empezó (reportado probando el caso de Brasil). */}
              <span className="gp-hero-proto__eyebrow">
                {gp.isInProgress ? "Carrera en curso" : "Próxima carrera"}
              </span>
              <h2 className="gp-hero-proto__title">{gp.title}</h2>

              {/* Pedido: "¿no hay demasiados call to action?" — había 3 botones
                  compitiendo (Ver circuito grande + Predecir ahora chico arriba
                  + Horarios), con jerarquía invertida: el grande mandaba a una
                  página secundaria mientras el realmente importante para el
                  negocio (predecir) quedaba perdido arriba. Ahora un solo CTA
                  dominante acá ("Predecir ahora", mismo lugar/tamaño que tenía
                  "Ver circuito" — .gp-hero-proto__cta sin cambios) y "Ver
                  circuito" baja a link de texto secundario al lado. El chico de
                  arriba (.nr-cta__meta) se terminó sacando también — ver
                  comentario ahí, se leía como el mismo botón duplicado. */}
              <div className="gp-hero-proto__actions">
                {/* Pedido: "si la sesión está en curso el botón debe funcionar
                    como en la barra de contador" — ahí (NextRaceCTA.jsx real)
                    "Predecir ahora" directamente no se renderiza cuando
                    computeRaceState().canPredict es false (ver status.canPredict
                    en ese archivo), que es siempre el caso mientras isInProgress
                    es true. Acá, al ser el CTA principal del hero, no alcanza
                    con que desaparezca sin más — queda una marca "En curso" en
                    su lugar (no clickeable, mismo lenguaje rojo/punto animado
                    que el tag de arriba) en vez de dejar el hueco vacío. */}
                {gp.isInProgress ? (
                  <span className="gp-hero-proto__cta gp-hero-proto__cta--live">
                    <span className="live-indicator"></span> En curso
                  </span>
                ) : (
                  <a href="#" className="gp-hero-proto__cta" onClick={(e) => e.preventDefault()}>
                    Predecir ahora
                  </a>
                )}
                <a href="#" className="gp-hero-proto__secondary-link" onClick={(e) => e.preventDefault()}>
                  Ver circuito
                </a>
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
                <p className="gp-hero-proto__drawer-title">{gp.title}</p>
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
