import { motion, useReducedMotion } from "framer-motion";
import Confetti from "./Confetti";
import CountryDisplay from "./CountryDisplay";
import { getImageUrl, CLOUDINARY_DEFAULTS } from "../utils/cloudinary.js";
import { CONFETTI_BY_RANK, SHINE_DELAY_BY_RANK } from "./podiumAnimations";
import "../assets/styles/podium.css";
import "../assets/styles/user-podium.css";

// Fondos ilustrados por puesto: src/assets/podium/pos1.png, pos2.png, pos3.png.
// Con glob, si todavía falta alguno la card usa el fondo oscuro de respaldo.
const BACKGROUNDS = import.meta.glob("../assets/podium/pos*.png", {
    eager: true,
    import: "default",
});

// Tramas por puesto del podio de constructores: team-pos1.png, team-pos2.png, team-pos3.png
const TEAM_BACKGROUNDS = import.meta.glob("../assets/podium/team-pos*.png", {
    eager: true,
    import: "default",
});

const getBackground = (rank) => BACKGROUNDS[`../assets/podium/pos${rank}.png`];
const getTeamBackground = (rank) => TEAM_BACKGROUNDS[`../assets/podium/team-pos${rank}.png`];

/**
 * Podio de 3 cards (Home, Ranking global/GP y campeonatos de Standings):
 * fondo, puesto arriba a la izquierda, tag de país arriba a la derecha y
 * franja inferior con avatar/logo · nombre · puntos, más confeti y brillo
 * en loop (clases en podium.css).
 * `entries`: [{ id, rank (1-3), firstName, lastName, country? (iso2),
 *              points, img (usuarios: public id de la foto de perfil) }]
 * Variantes opcionales por entry:
 * - `bg`: foto de fondo (piloto), con encuadre alto. Sin `bg` ni `bgLogo`
 *   se usa la ilustración por puesto (usuarios).
 * - `bgLogo`: constructores; trama del puesto (team-pos1-3.png) con el logo grande encima.
 * - `logo`: si la entry trae la clave (aunque sea vacía), el footer muestra
 *   el isologo de la escudería en lugar de la foto de perfil.
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
                const background = entry.bg || (entry.bgLogo ? getTeamBackground(entry.rank) : getBackground(entry.rank));
                const hasLogo = "logo" in entry;
                const modifier = entry.bg ? " user-podium__item--photo" : entry.bgLogo ? " user-podium__item--team" : "";
                return (
                    <motion.div
                        key={entry.id}
                        className={`user-podium__item user-podium__item--pos${entry.rank}${modifier}`}
                        initial={reduceMotion ? false : { opacity: 0, y: 48 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={reduceMotion ? undefined : { y: -6, transition: { duration: 0.2, delay: 0 } }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: (3 - entry.rank) * 0.15 }}
                    >
                        {background && (
                            <img className="user-podium__bg" src={background} alt="" aria-hidden="true" />
                        )}
                        {entry.bgLogo && (
                            <img
                                className="user-podium__bg-logo"
                                src={getImageUrl(entry.bgLogo, 400)}
                                alt=""
                                aria-hidden="true"
                                onError={(e) => { e.target.style.display = "none"; }}
                            />
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
                        <CountryDisplay
                            iso2={entry.country}
                            showName={false}
                            className="tag-vertical user-podium__tag"
                        />
                        <div className="user-podium__footer">
                            {hasLogo ? (
                                entry.logo && (
                                    <img
                                        className="user-podium__avatar user-podium__avatar--logo"
                                        src={getImageUrl(entry.logo, 100)}
                                        alt=""
                                        onError={(e) => { e.target.style.display = "none"; }}
                                    />
                                )
                            ) : (
                                <img
                                    className="user-podium__avatar"
                                    src={getImageUrl(entry.img || CLOUDINARY_DEFAULTS.PROFILE, 100, "profile")}
                                    alt={`${entry.firstName} ${entry.lastName}`}
                                />
                            )}
                            <p className="user-podium__name">
                                {entry.firstName} <strong>{entry.lastName}</strong>
                            </p>
                            <span className="user-podium__points">
                                <strong>{entry.points}</strong> pts
                            </span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default UserPodium;
