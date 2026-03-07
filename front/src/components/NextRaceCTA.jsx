import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import racesServices from "../services/races.services";
import * as countriesServices from "../services/countries.services";
import { formatRaceDate, getFlagEmoji, computeRaceState } from "../utils/helpers";

function NextRaceCTA() {
    const [race, setRace] = useState(null);
    const [countryName, setCountryName] = useState("");
    const [timeLeft, setTimeLeft] = useState({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00"
    });
    const [status, setStatus] = useState({ isClosed: false, isInProgress: false, canPredict: false, isPreWindow: false });

    useEffect(() => {
        async function fetchNextRace() {
            try {
                const data = await racesServices.findCurrentOrNext();
                if (data) {
                    setRace(data);

                    const countryIso = data.circuit?.country || data.id_circuit?.country;
                    if (countryIso) {
                        try {
                            const country = await countriesServices.getOneCountry(countryIso);
                            setCountryName(country?.name || countryIso);
                        } catch (err) {
                            console.error("Error fetching country name:", err);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching next race for CTA:", error);
            }
        }

        fetchNextRace();
    }, []);

    useEffect(() => {
        if (!race) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const startMs = new Date(race.date_race).getTime();
            const duration = race.totalDuration || 7200000;
            const endMs = startMs + duration;

            const currentStatus = computeRaceState(race);
            setStatus(currentStatus);

            let difference = 0;
            if (currentStatus.isInProgress) {
                // Si está en curso, el contador muestra cuánto falta para el FIN de las 2 horas
                difference = endMs - now;
            } else {
                // Si es futura, muestra cuánto falta para el INICIO
                difference = startMs - now;
            }

            if (difference <= 0) {
                difference = 0;
            }

            const days = String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, "0");
            const hours = String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, "0");
            const minutes = String(Math.floor((difference / (1000 * 60)) % 60)).padStart(2, "0");
            const seconds = String(Math.floor((difference / 1000) % 60)).padStart(2, "0");

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [race]);

    if (!race) return null;

    return (
        <section className="nr-cta">
            <div className="nr-cta__container container">
                <div className="nr-cta__info">
                    <div className="nr-cta__country">
                        <span className="emoji-flag me-2 nr-cta__flag">
                            {getFlagEmoji(race.circuit?.country || race.id_circuit?.country)}
                        </span>
                        <span className="nr-cta__country-name">{countryName.toUpperCase()}</span>
                    </div>

                    <div className="nr-cta__meta">
                        <span className="nr-cta__round">RONDA {race.round || "—"}</span>
                        <span className="nr-cta__date">
                            {formatRaceDate(race.date_gp_start, race.date_gp_end, race.circuit?.timezone).toUpperCase()}
                        </span>

                        {status.isInProgress && (
                            <span className={`nr-cta__session-tag session-${race.points_system?.type || 'race'}`}>
                                {race.points_system?.type?.toUpperCase() === 'QUALIFYNG' ? 'QUALY' :
                                    race.points_system?.type?.toUpperCase() === 'SPRINT' ? 'SPRINT' : 'CARRERA'} EN CURSO
                            </span>
                        )}

                        {status.canPredict && (
                            <Link to="/predictions" className="nr-cta__action">
                                Predecir ahora <span aria-hidden="true">››</span>
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
                        <span className="nr-cta__time-label">HS</span>
                    </div>

                    <div className="nr-cta__time">
                        <span className="nr-cta__time-value">{timeLeft.minutes}</span>
                        <span className="nr-cta__time-label">MIN</span>
                    </div>

                    <div className="nr-cta__time">
                        <span className="nr-cta__time-value">{timeLeft.seconds}</span>
                        <span className="nr-cta__time-label">SEG</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default NextRaceCTA;
