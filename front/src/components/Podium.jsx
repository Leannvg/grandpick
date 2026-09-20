import { motion, useReducedMotion } from "framer-motion";
import Confetti from "./Confetti";
import { getFlagEmoji } from "../utils/helpers";
import { getImageUrl, CLOUDINARY_DEFAULTS } from "../utils/cloudinary.js";
import "../assets/styles/podium.css";

// Variación de confeti por puesto (misma paleta, distinto ritmo y forma)
const CONFETTI_BY_RANK = {
    1: {},
    2: { count: 12, seed: 2, speed: 0.7, roundRatio: 0.85 },
    3: { count: 16, seed: 3, speed: 1.3, roundRatio: 0 },
};

/**
 * Podio de 3 tarjetas (estilo F1/F2) reutilizable para usuarios y pilotos.
 * `entries`: [{ id, rank (1-3), firstName, lastName, country (iso2),
 *              points, img (public id de Cloudinary), subtitle? }]
 * Orden visual en desktop: 2º · 1º · 3º; en mobile se apilan 1º · 2º · 3º.
 */
const Podium = ({ entries = [] }) => {
    const reduceMotion = useReducedMotion();

    const ordered = [2, 1, 3]
        .map((rank) => entries.find((e) => e.rank === rank))
        .filter(Boolean);

    if (ordered.length === 0) return null;

    return (
        <div className="ranking__podium">
            {ordered.map((entry) => (
                <motion.div
                    key={entry.id}
                    className={`podium__item podium__item--pos${entry.rank}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 48 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={reduceMotion ? undefined : { y: -6, transition: { duration: 0.2, delay: 0 } }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: (3 - entry.rank) * 0.15 }}
                >
                    <img
                        className="podium__photo"
                        src={getImageUrl(entry.img || CLOUDINARY_DEFAULTS.PROFILE, 400)}
                        alt={`${entry.firstName} ${entry.lastName}`}
                    />
                    <Confetti {...CONFETTI_BY_RANK[entry.rank]} />
                    {!reduceMotion && (
                        <motion.span
                            className="podium__shine"
                            aria-hidden="true"
                            initial={{ x: "-130%" }}
                            animate={{ x: "130%" }}
                            transition={{
                                duration: 1.4,
                                ease: "easeInOut",
                                repeat: Infinity,
                                repeatDelay: 3.5,
                                delay: 1 + entry.rank * 0.6,
                            }}
                        />
                    )}
                    <div className="podium__info">
                        <span className="podium__rank">{entry.rank}<sup>º</sup></span>
                        <p className="podium__name">
                            {entry.firstName} <strong>{entry.lastName}</strong>
                        </p>
                        {entry.subtitle && <p className="podium__subtitle">{entry.subtitle}</p>}
                        <span className="emoji-flag podium__flag">{getFlagEmoji(entry.country)}</span>
                        <span className="podium__points">
                            <strong>{entry.points}</strong> pts
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default Podium;
