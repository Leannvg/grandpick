import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import racesServices from "../services/races.services";
import practiceSessionsServices from "../services/practiceSessions.services";
import UsersServices from "../services/users.services";
import PredictionsServices from "../services/predictions.services";
import * as countriesServices from "../services/countries.services";
import { formatRaceDate, getFlagEmoji, computeRaceState } from "../utils/helpers";
import { buildSchedule } from "../utils/schedule";
import ScheduleGroups from "./calendar/ScheduleGroups";
import { onSocketReady } from "../socket";

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
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [zoneMode, setZoneMode] = useState("mine");
    const [sessions, setSessions] = useState([]);
    const [practices, setPractices] = useState([]);
    const [predictionsByRaceId, setPredictionsByRaceId] = useState({});

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
            } else {
                setRace(null);
            }
        } catch (error) {
            console.error("Error fetching next race for CTA:", error);
        }
    }

    useEffect(() => {
        fetchNextRace();

        let currentSocket = null;
        const handleRacesUpdated = () => fetchNextRace();

        const cleanup = onSocketReady((socket) => {
            currentSocket = socket;
            socket.on("races:updated", handleRacesUpdated);
        });

        return () => {
            if (cleanup) cleanup();
            if (currentSocket) {
                currentSocket.off("races:updated", handleRacesUpdated);
            }
        };
    }, []);

    useEffect(() => {
        if (!race) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const startMs = new Date(race.date_race).getTime();
            const duration = race.totalDuration || 5400000;
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

    // Horarios del fin de semana completo del GP en el contador (no solo la sesión
    // actual/próxima que trae findCurrentOrNext): mismo desglose que usa el calendario.
    useEffect(() => {
        const circuitId = race?.circuit?._id;
        if (!circuitId) {
            setSessions([]);
            setPractices([]);
            return;
        }
        const year = new Date(race.date_gp_start).getFullYear();

        racesServices.findByCircuitAndYear(circuitId, year)
            .then((data) => setSessions(data?.race_types || []))
            .catch((err) => {
                console.error("Error al cargar sesiones del GP para el contador:", err);
                setSessions([]);
            });

        practiceSessionsServices.findAll({ year, circuitId })
            .then(setPractices)
            .catch((err) => {
                console.error("Error al cargar prácticas del GP para el contador:", err);
                setPractices([]);
            });
    }, [race?.circuit?._id, race?.date_gp_start]);

    // Para marcar en el desglose qué sesiones ya tiene predichas el usuario (mismo
    // criterio que Calendar.jsx). Página pública: sin sesión iniciada, no se pide nada.
    useEffect(() => {
        if (!localStorage.getItem("auth-token")) {
            setPredictionsByRaceId({});
            return;
        }
        const year = race?.date_gp_start ? new Date(race.date_gp_start).getFullYear() : new Date().getFullYear();

        UsersServices.getUserProfile()
            .then((profile) => PredictionsServices.findHistoryByUser(profile._id, year))
            .then((historyData) => {
                const map = {};
                historyData.forEach((gp) => {
                    gp.sessions.forEach((s) => {
                        if (s.prediction) map[s._id] = true;
                    });
                });
                setPredictionsByRaceId(map);
            })
            .catch((err) => {
                console.error("Error al cargar mis predicciones para el contador:", err);
                setPredictionsByRaceId({});
            });
    }, [race?.date_gp_start]);

    const groups = useMemo(
        () => buildSchedule(
            [...sessions].sort((a, b) => new Date(a.date_race) - new Date(b.date_race)),
            practices
        ),
        [sessions, practices]
    );

    if (!race) return null;

    // Mismas 3 claves que el chip de sesión del calendario/historial
    // (qualy/sprint/race), para colorear igual en todo el sitio.
    const sessionType = race.points_system?.type === "qualifying"
        ? "qualy"
        : (race.points_system?.type || "race");

    const circuitZone = race.circuit?.timezone || "UTC";
    const circuitId = race.circuit?._id;
    const hasSchedule = groups.length > 0;
    const schedulePanelId = "nr-cta-schedule";

    return (
        <section className={`nr-cta ${scheduleOpen ? "is-open" : ""}`}>
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

            {hasSchedule && (
                <>
                    <button
                        type="button"
                        className="nr-cta__schedule-toggle"
                        onClick={() => setScheduleOpen((v) => !v)}
                        aria-expanded={scheduleOpen}
                        aria-controls={schedulePanelId}
                        aria-label={scheduleOpen ? "Ocultar horarios del fin de semana" : "Ver horarios del fin de semana"}
                    >
                        <i className="bi bi-chevron-down nr-cta__schedule-chevron"></i>
                    </button>

                    <div className="nr-cta__schedule-wrap" id={schedulePanelId}>
                        <div className="nr-cta__schedule-panel">
                            <div className="nr-cta__schedule-inner container">
                                <ScheduleGroups
                                    groups={groups}
                                    zoneMode={zoneMode}
                                    setZoneMode={setZoneMode}
                                    circuitZone={circuitZone}
                                    circuitId={circuitId}
                                    predictionsByRaceId={predictionsByRaceId}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}

export default NextRaceCTA;
