import GpHeroPrototype from "./GpHeroPrototype.jsx";
import PredictionCardsPrototype from "./PredictionCardsPrototype.jsx";
import australiaPhoto from "../assets/australia.jpg";
import brasilPhoto from "../assets/brasil.jpg";
import lasVegasPhoto from "../assets/lasvegas.jpg";
import qatarPhoto from "../assets/qatar.jpg";
import yasMarinaPhoto from "../assets/yasmarina.jpg";
import crystalBallIcon from "../../assets/icons/crystal_ball.png";

// Pedido: probar la foto de fondo con GPs reales además de Australia (la
// única que había hasta ahora) — mismos datos mock de horarios para las
// cuatro, lo que cambia es la foto/bandera/país/título (ver prop `gp` en
// GpHeroPrototype.jsx). Son, en orden, los 4 GP que le quedan a la
// temporada (únicas fotos que hay por ahora) — Brasil ya está en curso
// hoy, de ahí el round "CARRERA" + isInProgress en vez de "QUALIFYING".
//
// Pedido: "el banner también debe cambiar una vez que se cambie al
// contador del próximo circuito" — en la implementación real, `gp` no
// sería estático como acá: saldría de la misma carrera que ya resuelve
// racesServices.findCurrentOrNext() (lo que usa NextRaceCTA.jsx hoy, con
// su re-fetch en el evento socket "races:updated"), buscando la foto por
// race.circuit._id. El fallback sin foto (bloque de arriba) ya cubre el
// caso general: la mayoría de los circuitos todavía no van a tener una
// foto cargada (acá solo existen estas 4 + Australia), así que ese
// camino no es un caso especial a resolver después, ya está contemplado
// desde el diseño.
const SAMPLE_GPS = [
  { key: "brasil", photo: brasilPhoto, flag: "🇧🇷", country: "BRASIL", date: "07–09 NOVIEMBRE", title: "Gran Premio de Brasil", round: { label: "CARRERA", type: "race" }, isInProgress: true },
  { key: "lasvegas", photo: lasVegasPhoto, flag: "🇺🇸", country: "ESTADOS UNIDOS", date: "20–22 NOVIEMBRE", title: "Gran Premio de Las Vegas", round: { label: "QUALIFYING", type: "qualy" } },
  { key: "qatar", photo: qatarPhoto, flag: "🇶🇦", country: "QATAR", date: "28–30 NOVIEMBRE", title: "Gran Premio de Qatar", round: { label: "QUALIFYING", type: "qualy" } },
  { key: "yasmarina", photo: yasMarinaPhoto, flag: "🇦🇪", country: "EMIRATOS ÁRABES UNIDOS", date: "05–07 DICIEMBRE", title: "Gran Premio de Abu Dabi", round: { label: "QUALIFYING", type: "qualy" } },
];

/**
 * Espacio de trabajo para diseños en evaluación, todavía no aprobados ni
 * conectados a datos reales — a diferencia de "Componentes"/"Patrones"
 * (que documentan lo ya existente), acá vive lo que se está iterando antes
 * de decidir si pasa a producción. Cada prototipo lo dice explícitamente.
 */
function PrototypesSection() {
  return (
    <div>
      <h1 className="lab-section-title">Prototipos</h1>
      <p className="lab-section-desc">
        Diseños en evaluación, no aprobados todavía. No están conectados al
        backend ni a ningún archivo de producción — cuando se apruebe uno,
        recién ahí se decide qué pasa al diseño real.
      </p>

      <div className="lab-block">
        <h2 className="lab-block-title">Banner de próxima carrera con foto por GP</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Reemplazaría a <code>NextRaceCTA.jsx</code>: foto de fondo
          específica del circuito (nueva, el campo <code>Circuits.img</code>{" "}
          actual es el mapa de pista, no sirve para esto), con degradado de
          legibilidad, título grande y botón a la ficha del circuito. Incluye
          el botón solapado de horarios desplegables (mismo mecanismo que se
          había probado, con datos mock). Foto de muestra: Australia. Abajo,
          la misma versión sin foto (fallback para los GPs que todavía no
          tengan una cargada).
        </p>
        {/* Sin .lab-specimen a propósito: ese wrapper del laboratorio tiene
            overflow:hidden para sus recuadros de preview, y recorta el botón
            solapado de horarios que sobresale del borde inferior (confirmado
            probándolo — el propio gp-hero-proto ya trae sus esquinas
            redondeadas, no necesita el marco del lab). */}
        <GpHeroPrototype withPhoto />
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Mismo banner, sin foto (fallback)</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Degradado con los tokens existentes (<code>--color-accent</code>),
          misma altura que la versión con foto para que la página no
          &ldquo;salte&rdquo; al cambiar de GP.
        </p>
        <GpHeroPrototype withPhoto={false} />
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Prueba con fotos de otros GPs</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Mismo banner, variando la foto de fondo para ver cómo se comporta
          el degradado/contraste de legibilidad con distintos encuadres y
          condiciones de luz (circuito callejero de noche, desierto, pista
          tradicional de día). Horarios con los mismos datos mock que la
          versión de Australia, arriba — acá lo que se evalúa es la foto.
        </p>
        {SAMPLE_GPS.map((gp) => (
          <div key={gp.key} style={{ marginBottom: 24 }}>
            <GpHeroPrototype withPhoto gp={gp} />
          </div>
        ))}
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Mismo banner, como cabecera de Predicciones</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Pedido: probar este banner (foto + topbar flotante, igual que en
          Home) como cabecera de <code>Predictions.jsx</code>, que hoy tiene
          su propio header de texto plano sobre fondo sólido, con la barra
          de arriba también sólida (no flotante). Reusa todo el mecanismo
          del banner (foto, topbar transparente, horarios). Abajo: solo
          título, el countdown "tiempo restante para predecir" y el banner
          de estado de la predicción (<code>.prediction-status-banner</code>,
          sin cambios) — país, fecha y ronda ya están en el topbar, se
          sacaron de acá para no repetirlos (reportado con captura).
        </p>
        <GpHeroPrototype
          withPhoto
          variant="predictions"
          gp={{ ...SAMPLE_GPS[0], round: { label: "RACE", type: "race" }, isInProgress: false }}
        />

        {/* Pedido: "¿sería mucho estirar la imagen por detrás de los 10
            select?" — no, 10 filas interactivas sobre la foto compiten con
            las cards blancas y rompen el patrón de "foto arriba, contenido
            abajo" que ya usa todo el sitio (Home, Calendario). En vez de
            estirar la foto, se continúa el mismo tono oscuro con el que
            termina el degradado del banner (gp-hero-proto__predict-below),
            así no hay un corte brusco entre el banner y la lista aunque la
            foto en sí quede contenida arriba. Muestra parcial (4 de las 10
            filas reales) — acá lo que se evalúa es la transición de fondo,
            no los selects en sí (son los reales de Predictions.jsx,
            .prediction-card/.prediction-rank/.prediction-select-wrapper,
            de predictions.css, sin tocar; el control del select se
            aproxima visualmente nomás, no es el SearchableSelect real). */}
        <div className="gp-hero-proto__predict-below">
          <div className="prediction-cards-container container">
            {[1, 2, 3, 4].map((n) => (
              <div className="prediction-card" key={n}>
                <div className="prediction-rank">{String(n).padStart(2, "0")}</div>
                <div className="prediction-select-wrapper">
                  <div className="gp-hero-proto__predict-select-mock">
                    <span>Seleccione un piloto</span>
                    <i className="bi bi-chevron-down"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="lab-prose" style={{ textAlign: "center", opacity: .6, marginTop: -4 }}>
            (muestra parcial — son 10 filas en la pantalla real)
          </p>
          <div className="prediction-actions">
            <button type="button" className="btn-submit-prediction" disabled title="Guardar predicción">
              <img src={crystalBallIcon} alt="Predecir" className="crystal-ball-icon" />
            </button>
          </div>
        </div>
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Efecto de clima animado (lluvia)</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Pedido: "¿es posible agregar un efecto de lluvia al banner?...
          tormenta, sol, nublado, noche calurosa, cada uno con animación".
          Arranca con lluvia nomás, para validar el mecanismo antes de
          construir el resto — foto de Brasil (ya tiene cielo tormentoso,
          encaja). Capa de CSS puro encima de la foto (dos capas de gotas,
          "cerca"/"lejos", animadas en diagonal), sin canvas ni librerías.
          Dato 100% mock por ahora (<code>gp.weather</code>) — no hay
          ningún campo real de clima todavía; de dónde saldría ese dato en
          la implementación real es una conversación aparte.
        </p>
        <GpHeroPrototype
          withPhoto
          gp={{ ...SAMPLE_GPS[0], round: { label: "CARRERA", type: "race" }, isInProgress: true, weather: "rain" }}
        />
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Efecto de clima animado (tormenta)</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Pedido: "probemos una tormenta" — reusa toda la lluvia de arriba
          (más densa y con más deriva por viento) y le suma relámpagos: un
          flash breve e irregular de luz fría sobre toda la escena (2 capas
          de destellos independientes, mismo criterio que la lluvia para
          que no se note un ciclo fijo). <code>gp.weather = "storm"</code>.
        </p>
        <GpHeroPrototype
          withPhoto
          gp={{ ...SAMPLE_GPS[0], round: { label: "CARRERA", type: "race" }, isInProgress: true, weather: "storm" }}
        />
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Efecto de clima animado (nublado)</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Pedido: "pasemos a los demás efectos de clima" — tinte grisáceo
          plano sobre la foto + sombras de nubes grandes y difusas
          meciéndose lento (sin trasladarse y reiniciar de golpe como la
          lluvia: oscilan de un lado al otro con
          <code> animation-direction: alternate</code>, así nunca hay un
          salto que disimular). <code>gp.weather = "cloudy"</code>.
        </p>
        <GpHeroPrototype
          withPhoto
          gp={{ ...SAMPLE_GPS[0], round: { label: "CARRERA", type: "race" }, isInProgress: true, weather: "cloudy" }}
        />
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Efecto de clima animado (sol)</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Tinte cálido sobre la foto + un resplandor en la esquina que
          "respira" (escala/opacidad oscilando, mismo criterio de
          <code> alternate</code> que nublado). Foto de Australia (de día,
          buena luz). <code>gp.weather = "sun"</code>.
        </p>
        <GpHeroPrototype
          withPhoto
          gp={{
            photo: australiaPhoto,
            flag: "🇦🇺",
            country: "AUSTRALIA",
            date: "06–08 NOVIEMBRE",
            title: "Gran Premio de Australia",
            round: { label: "CARRERA", type: "race" },
            isInProgress: true,
            weather: "sun",
          }}
        />
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Efecto de clima animado (noche calurosa)</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Tinte oscuro azul/violeta + estrellas titilando (cada una con su
          propio ritmo) + un resplandor cálido subiendo desde el piso,
          simulando el calor de una noche de carrera en el desierto. Foto
          de Qatar (carrera nocturna real). <code>gp.weather = "night"</code>.
        </p>
        <GpHeroPrototype
          withPhoto
          gp={{ ...SAMPLE_GPS[2], round: { label: "CARRERA", type: "race" }, isInProgress: true, weather: "night" }}
        />
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Predicciones: cards tipo vidrio + reordenar arrastrando</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Pedido: "si tuvieras que rediseñar los selects para que queden
          bien con el diseño del banner y la transparencia, cómo lo
          harías? se puede agregar algún diseño nuevo para probar, que
          sea UX/UI y quede más moderno, que se pueda mover los pilotos
          de posición arrastrando?". Dos cambios sobre el diseño real: (1)
          cards tipo vidrio (blur + semitransparente) en vez del card
          blanco opaco de hoy, mismo lenguaje que el banner; (2) picker de
          piloto propio, construido desde cero (no es una versión pintada
          del <code>react-select</code> actual — su menú se abre en un
          portal a <code>document.body</code>, fuera del card, y un
          override global hubiera chocado con los otros mocks de esta
          misma página que también usan <code>SearchableSelect</code>).
          Arrastrando el ícono de la derecha de cada fila se reordena la
          posición (las demás se corren con animación); el selector sigue
          sirviendo para elegir/cambiar qué piloto va en cada lugar — si
          elegís uno que ya estaba en otra posición, las dos se
          intercambian en vez de duplicarse. 100% mock (datos de pilotos
          y colores de escudería inventados para la prueba, no pegan
          contra el backend).
        </p>
        <PredictionCardsPrototype />
      </div>
    </div>
  );
}

export default PrototypesSection;
