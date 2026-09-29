import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

const DEFAULT_COLORS = ["#DDBF4A", "#FFFFFF", "#7AB3DE", "#E10600", "#D8D8D8"];

// Valores pseudo-aleatorios deterministas (estables entre renders)
const seeded = (i, salt, seed = 0) => {
    const x = Math.sin(i * 12.9898 + salt * 78.233 + seed * 37.719) * 43758.5453;
    return x - Math.floor(x);
};

/**
 * Confeti que cae en loop dentro del contenedor posicionado más cercano.
 * Sin UI interactiva (pointer-events: none). No renderiza si el usuario
 * pidió reducir movimiento.
 *
 * Usa una animación CSS nativa (`@keyframes confetti-fall` en podium.css)
 * en vez de `framer-motion`: en producción, la versión con
 * `repeat: Infinity` de framer-motion se congelaba después de un tiempo sin
 * causa aislable (no reproducía en un harness mínimo, con mount limpio
 * confirmado por logs) — ver rules/registro-de-cambios.md, 2026-09-29. El
 * loop `animation-iteration-count: infinite` lo maneja el motor de
 * renderizado directamente, sin pasar por WAAPI orquestado por React.
 *
 * Props: `count` (piezas), `colors`, `seed` (cambia la distribución),
 * `speed` (multiplicador de velocidad: >1 más rápido) y `roundRatio` (0–1,
 * proporción de piezas redondas vs. tiras) para diferenciar instancias.
 */
const Confetti = ({ count = 14, colors = DEFAULT_COLORS, seed = 0, speed = 1, roundRatio = 0.3 }) => {
    const reduceMotion = useReducedMotion();

    const pieces = useMemo(
        () =>
            Array.from({ length: count }, (_, i) => {
                const spin = (seeded(i, 5, seed) > 0.5 ? 1 : -1) * (360 + seeded(i, 6, seed) * 360);
                const round = seeded(i, 7, seed) < roundRatio;
                const size = 5 + seeded(i, 2, seed) * 5;
                return {
                    key: i,
                    style: {
                        left: `${seeded(i, 1, seed) * 100}%`,
                        width: size,
                        height: round ? size : size * 1.6,
                        borderRadius: round ? "50%" : 1,
                        backgroundColor: colors[i % colors.length],
                        animationDuration: `${(3 + seeded(i, 3, seed) * 3) / speed}s`,
                        animationDelay: `${seeded(i, 4, seed) * 4}s`,
                        "--confetti-spin": `${spin}deg`,
                    },
                };
            }),
        [count, colors, seed, speed, roundRatio]
    );

    if (reduceMotion) return null;

    return (
        <div className="confetti" aria-hidden="true">
            {pieces.map((p) => (
                <span key={p.key} className="confetti__piece" style={p.style} />
            ))}
        </div>
    );
};

export default Confetti;
