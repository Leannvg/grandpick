import { motion, useReducedMotion } from "framer-motion";
import Confetti from "./Confetti";
import { getFlagEmoji } from "../utils/helpers";
import { getImageUrl, CLOUDINARY_DEFAULTS } from "../utils/cloudinary.js";
import "../assets/styles/podium.css";
import "../assets/styles/user-podium.css";

// Fondos ilustrados por puesto: src/assets/podium/pos1.png, pos2.png, pos3.png.
// Con glob, si todavía falta alguno la card usa el fondo oscuro de respaldo.
const BACKGROUNDS = import.meta.glob("../assets/podium/pos*.png", {
    eager: true,
    import: "default",
});

// Mismas variaciones de confeti y delays de brillo que `Podium.jsx`
const CONFETTI_BY_RANK = {
    1: {},
    2: { count: 12, seed: 2, speed: 0.7, roundRatio: 0.85 },
    3: { count: 16, seed: 3, speed: 1.3, roundRatio: 0 },
};

const SHINE_DELAY_BY_RANK = {
    1: "1.6s",
    2: "2.2s",
    3: "2.8s",
};

const getBackground =(rank) => BACKGROUNDS[`../assets/podium/pos${rank}.png`];

/**
 * Podio de usuarios (Home y Ranking global/GP): card con ilustración por
 * puesto, foto y puntos a la derecha, bandera y nombre completo abajo,
 * más confeti y brillo en loop (clases en podium.css).
 * `entries`: [{ id, rank (1-3), firstName, lastName, country (iso2),
 *              points, img (public id de Cloudinary) }]
 * Orden visual en desktop: 2º · 1º · 3º; en mobile se apilan 1º · 2º · 3º.
 */
const UserPodium = ({ entries = [] }) => {
    const reduceMotion = useReducedMotion();

    const ordered = [2, 1, 3]
        .map((rank) => entries.find((e) => e.rank === rank))
        .filter(Boolean);

    if (ordered.length === 0) return null;

    return (
        <div className="ranking__podium">
            {ordered.map((entry) => {
                const background = getBackground(entry.rank);
                return (
                    <motion.div
                        key={entry.id}
                        className={`user-podium__item user-podium__item--pos${entry.rank}`}
                        initial={reduceMotion ? false : { opacity: 0, y: 48 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={reduceMotion ? undefined : { y: -6, transition: { duration: 0.2, delay: 0 } }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: (3 - entry.rank) * 0.15 }}
                    >
                        {background && (
                            <img className="user-podium__bg" src={background} alt="" aria-hidden="true" />
                        )}
                        <Confetti {...CONFETTI_BY_RANK[entry.rank]} />
                        {!reduceMotion && (
                            <span
                                className="podium__shine"
                                aria-hidden="true"
                                style={{ "--shine-delay": SHINE_DELAY_BY_RANK[entry.rank] }}
                            />
                        )}
                        <span className="user-podium__rank">{entry.rank}<sup>º</sup></span>
                        <div className="user-podium__side">
                            <img
                                className="user-podium__box user-podium__avatar"
                                src={getImageUrl(entry.img || CLOUDINARY_DEFAULTS.PROFILE, 200, "profile")}
                                alt={`${entry.firstName} ${entry.lastName}`}
                            />
                            <span className="user-podium__box user-podium__points">
                                <strong>{entry.points}</strong> pts
                            </span>
                        </div>
                        <div className="user-podium__footer">
                            <span className="emoji-flag user-podium__flag">{getFlagEmoji(entry.country)}</span>
                            <p className="user-podium__name">
                                {entry.firstName} <strong>{entry.lastName}</strong>
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default UserPodium;
