import GpHeroPrototype from "./GpHeroPrototype.jsx";
import brasilPhoto from "../assets/brasil.jpg";
import lasVegasPhoto from "../assets/lasvegas.jpg";
import qatarPhoto from "../assets/qatar.jpg";
import yasMarinaPhoto from "../assets/yasmarina.jpg";

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
          del banner (foto, topbar transparente, horarios) — abajo cambia el
          contenido real de esa página: país, título, fecha, ronda (chip
          real <code>.nr-cta__round</code> en vez de texto plano), countdown
          "tiempo restante para predecir" y el banner de estado de la
          predicción (<code>.prediction-status-banner</code>, sin cambios).
        </p>
        <GpHeroPrototype
          withPhoto
          variant="predictions"
          gp={{ ...SAMPLE_GPS[0], round: { label: "RACE", type: "race" }, isInProgress: false }}
        />
      </div>
    </div>
  );
}

export default PrototypesSection;
