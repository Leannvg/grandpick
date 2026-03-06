import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import racesServices from "../services/races.services";
import * as countriesServices from "../services/countries.services";
import { formatRaceDate, getFlagEmoji } from "../utils/helpers";
import API_URL from "../services/api";

function NextRaceCTA() {
    const [race, setRace] = useState(null);
    const [countryName, setCountryName] = useState("");
    const [timeLeft, setTimeLeft] = useState({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00"
    });

    useEffect(() => {
        async function fetchNextRace() {
            try {
                const data = await racesServices.findCurrentOrNext();
                if (data) {
                    setRace(data);

                    // Fetch country info for name if needed, or just use ISO for now
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
            const targetMs = new Date(race.date_race).getTime();
            const now = Date.now();
            let difference = targetMs - now;

            if (difference <= 0) {
                difference = 0;
                clearInterval(interval);
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
            <div>

                <div className="nr-cta__container container">
                    {/* INFO */}
                    <div className="nr-cta__info">
                        <div className="nr-cta__country">
                            <span className="emoji-flag me-2 nr-cta__flag">
                                {getFlagEmoji(race.circuit?.country || race.id_circuit?.country)}
                            </span>
                            <span className="nr-cta__country-name">{countryName.toUpperCase()}</span>
                        </div>

                        <div className="nr-cta__meta">
                            {/* Assuming we can get the round from the race object or just hardcode for now if not available */}
                            <span className="nr-cta__round">RONDA {race.round || "—"}</span>
                            <span className="nr-cta__date">
                                {formatRaceDate(race.date_gp_start, race.date_gp_end).toUpperCase()}
                            </span>

                            <Link to="/predictions" className="nr-cta__action">
                                Predecir ahora <span aria-hidden="true">››</span>
                            </Link>
                        </div>
                    </div>

                    {/* COUNTDOWN */}
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
            </div>
        </section>
    );
}

export default NextRaceCTA;
