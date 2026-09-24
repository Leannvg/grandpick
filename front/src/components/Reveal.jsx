import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Envoltorio genérico para animar la aparición de contenido al hacer scroll
 * (fade + leve desplazamiento vertical). Se anima una sola vez, la primera
 * vez que entra en pantalla (`viewport={{ once: true }}`), y respeta
 * `prefers-reduced-motion`.
 *
 * @param {"div"|"section"|"article"|Component} as - Tag o componente (con
 *   forwardRef, ej. `Link` de react-router) a renderizar (default "div").
 * @param {number} delay - Delay en segundos, para escalonar varios `Reveal`
 *   hermanos (ej. tarjetas de una grilla).
 * @param {number} y - Desplazamiento vertical inicial en px (default 24).
 * @param {number} amount - Porción del elemento visible para disparar la
 *   animación (0 a 1, default 0.2).
 */
const Reveal = ({
  children,
  as = "div",
  delay = 0,
  y = 24,
  amount = 0.2,
  className,
  ...props
}) => {
  const reduceMotion = useReducedMotion();
  // Memoizado por identidad de `as`: crear motion(Component) en cada render
  // remonta el subárbol (pierde el estado de "ya se reveló" y puede parpadear).
  const Component = useMemo(
    () => (typeof as === "string" ? motion[as] || motion.div : motion(as)),
    [as]
  );

  return (
    <Component
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Reveal;
