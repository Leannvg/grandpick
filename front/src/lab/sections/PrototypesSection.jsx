import GpHeroPrototype from "./GpHeroPrototype.jsx";

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
    </div>
  );
}

export default PrototypesSection;
