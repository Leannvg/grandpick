import { Link } from "react-router-dom";
import { useNextRace } from "../hooks/useNextRace";
import { formatRaceDate, getFlagEmoji } from "../utils/helpers";

function NextRaceCTA() {
    const { race, countryName, timeLeft, status } = useNextRace();

    if (!race) return null;

    // Mismas 3 claves que el chip de sesión del calendario/historial
    // (qualy/sprint/race), para colorear igual en todo el sitio.
    const sessionType = race.points_system?.type === "qualifying"
        ? "qualy"
        : (race.points_system?.type || "race");

    return (
        <section className="nr-cta">
            <div className="nr-cta__container container">
                <div className="nr-cta__info">
                    <div className="nr-cta__country">
                        <span className="emoji-flag nr-cta__flag">
                            {getFlagEmoji(race.circuit?.country || race.id_circuit?.country)}
                        </span>
                        <span className="nr-cta__country-name">{countryName.toUpperCase()}</span>
                        <span className="nr-cta__date">
                            {formatRaceDate(race.date_gp_start, race.date_gp_end, race.circuit?.timezone).toUpperCase()}
                        </span>
                    </div>

                    <div className="nr-cta__meta">
                        <span className={`nr-cta__round nr-cta__round--${sessionType}`}>{race.points_system?.type?.toUpperCase() || "RACE"}</span>

                        {status.isInProgress && (
                            <span className="nr-cta__session-tag">
                                <span className="live-indicator"></span> EN CURSO
                            </span>
                        )}

                        {status.canPredict && (
                            <Link to="/predictions" className="nr-cta__action">
                                Predecir ahora
                            </Link>
                        )}
                    </div>
                </div>

                <div className="nr-cta__countdown">
                    <div className="nr-cta__time">
                        <span className="nr-cta__time-value">{timeLeft.days}</span>
                        <span className="nr-cta__time-label">DÍAS</span>
                    </div>

                    <div className="nr-cta__time">
                        <span className="nr-cta__time-value">{timeLeft.hours}</span>
                        <span className="nr-cta__time-label">HS.</span>
                    </div>

                    <div className="nr-cta__time">
                        <span className="nr-cta__time-value">{timeLeft.minutes}</span>
                        <span className="nr-cta__time-label">MIN.</span>
                    </div>

                    <div className="nr-cta__time">
                        <span className="nr-cta__time-value">{timeLeft.seconds}</span>
                        <span className="nr-cta__time-label">SEG.</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default NextRaceCTA;
