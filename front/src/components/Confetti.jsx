import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const DEFAULT_COLORS = ["#DDBF4A", "#FFFFFF", "#7AB3DE", "#E10600", "#D8D8D8"];

// Valores pseudo-aleatorios deterministas (estables entre renders)
const seeded = (i, salt) => {
    const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
};

/**
 * Confeti que cae en loop dentro del contenedor posicionado más cercano.
 * Sin UI interactiva (pointer-events: none). No renderiza si el usuario
 * pidió reducir movimiento.
 */
const Confetti = ({ count = 14, colors = DEFAULT_COLORS }) => {
    const reduceMotion = useReducedMotion();

    const pieces = useMemo(
        () =>
            Array.from({ length: count }, (_, i) => ({
                left: `${seeded(i, 1) * 100}%`,
                size: 5 + seeded(i, 2) * 5,
                color: colors[i % colors.length],
                duration: 3 + seeded(i, 3) * 3,
                delay: seeded(i, 4) * 4,
                spin: (seeded(i, 5) > 0.5 ? 1 : -1) * (360 + seeded(i, 6) * 360),
                round: seeded(i, 7) > 0.7,
            })),
        [count, colors]
    );

    if (reduceMotion) return null;

    return (
        <div className="confetti" aria-hidden="true">
            {pieces.map((p, i) => (
                <motion.span
                    key={i}
                    className="confetti__piece"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.round ? p.size : p.size * 1.6,
                        borderRadius: p.round ? "50%" : 1,
                        backgroundColor: p.color,
                    }}
                    initial={{ top: "-10%", rotate: 0, opacity: 0 }}
                    animate={{ top: "110%", rotate: p.spin, opacity: [0, 1, 1, 0] }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
};

export default Confetti;
