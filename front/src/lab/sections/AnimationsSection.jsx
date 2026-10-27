import { useReducedMotion } from "framer-motion";
import Reveal from "../../components/Reveal.jsx";

function AnimationsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <h1 className="lab-section-title">Animaciones</h1>
      <p className="lab-section-desc">
        Reglas completas en <code>rules/diseno.md</code> (sección
        «Animaciones»). Resumen:
      </p>

      <div className="lab-block">
        <h2 className="lab-block-title">Regla general</h2>
        <p className="lab-prose">
          Toda animación de UI se hace con <strong>framer-motion</strong>{" "}
          (<code>motion.*</code>, <code>AnimatePresence</code>,{" "}
          <code>whileInView</code>, <code>whileHover</code>, <code>drag</code>),
          no con keyframes/transiciones CSS nuevas. Duraciones cortas
          (0.2–0.5s), <code>ease: “easeOut”</code>, entradas con{" "}
          <code>opacity</code> + <code>y</code>/<code>scale</code>,{" "}
          <code>viewport={"{{ once: true }}"}</code> para animar al hacer
          scroll solo la primera vez, y siempre respetar{" "}
          <code>useReducedMotion()</code>. Ahora mismo tu navegador reporta
          reduced-motion = <strong>{reduceMotion ? "activado" : "desactivado"}</strong>.
        </p>
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Excepción: loops infinitos decorativos</h2>
        <p className="lab-prose">
          Confeti y brillo del podio usan <code>@keyframes</code> CSS nativo,
          no framer-motion — un loop de framer-motion con{" "}
          <code>repeat: Infinity</code> se «congelaba» en producción sin
          causa aislable. El motor de renderizado maneja el loop
          directamente, inmune al problema. Ver el detalle completo en{" "}
          <code>rules/diseno.md</code>.
        </p>
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Demo — Reveal al hacer scroll</h2>
        <p className="lab-prose">
          <code>components/Reveal.jsx</code>, usado en Home, Drivers, Teams,
          Circuits y Calendar. Scrolleá para ver las tarjetas entrar.
        </p>
        <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
          {[0, 0.1, 0.2].map((delay) => (
            <Reveal key={delay} delay={delay} className="lab-specimen" style={{ width: 160 }}>
              <div className="lab-specimen-stage lab-specimen-stage--dark" style={{ minHeight: 70 }}>
                delay {delay}s
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnimationsSection;
