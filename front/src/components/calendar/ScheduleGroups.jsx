import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import { formatSessionTime } from "../../utils/schedule";
import "../../assets/styles/calendar.css";

/**
 * Switch de zona horaria + desglose de sesiones de un fin de semana de GP.
 * Extraído de CalendarCard.jsx para reusarlo también en NextRaceCTA.jsx
 * (banner de la próxima carrera en el Home) sin duplicar el markup.
 * `groups`: salida de utils/schedule.js → buildSchedule().
 */
function ScheduleGroups({ groups, zoneMode, setZoneMode, circuitZone, circuitId, predictionsByRaceId = {} }) {
    return (
        <>
            <div className="cal-zone" role="group" aria-label="Zona horaria">
                <button
                    type="button"
                    className={zoneMode === "mine" ? "is-active" : ""}
                    onClick={() => setZoneMode("mine")}
                >
                    <i className="bi bi-person-fill"></i>Mi tiempo
                </button>
                <button
                    type="button"
                    className={zoneMode === "circuit" ? "is-active" : ""}
                    onClick={() => setZoneMode("circuit")}
                >
                    <i className="bi bi-geo-alt-fill"></i>Tiempo de circuito
                </button>
            </div>

            {groups.map((g, gi) => (
                <div className="cal-card__group" key={g.key}>
                    <div className="cal-card__group-title" style={{ "--i": gi * 3 }}>
                        <i className={`bi ${g.icon}`}></i>{g.title}
                    </div>
                    {g.items.map((it, i) => {
                        const t = formatSessionTime(it.iso, zoneMode === "mine" ? "local" : circuitZone);
                        const isPast = DateTime.fromISO(it.iso) <= DateTime.now();
                        const hasPrediction = it.predictable && !!predictionsByRaceId[it.id];
                        return (
                            <div className={`cal-session ${isPast ? "is-past" : ""}`} key={it.id} style={{ "--i": gi * 3 + i + 1 }}>
                                <div className="cal-session__date">
                                    <span className="cal-session__dow">{t.dow}</span>
                                    <span className="cal-session__dnum">{t.day}</span>
                                </div>
                                <span className="cal-session__sep" aria-hidden="true"></span>
                                <div className="cal-session__main">
                                    <span className="cal-session__name">{it.label}</span>
                                    <span className="cal-session__time">
                                        <i className="bi bi-clock"></i>{t.time}
                                    </span>
                                </div>
                                <div className="cal-session__end">
                                    {hasPrediction && circuitId && (
                                        <Link
                                            to={`/prediction-history?gp=${circuitId}&session=${it.sessionType}`}
                                            className="cal-session__predict-btn"
                                            title="Ver mi predicción"
                                        >
                                            <i className="bi bi-eye-fill"></i>
                                        </Link>
                                    )}
                                    {isPast && (
                                        <span className="cal-session__status-badge" title="Sesión finalizada">
                                            <i className="bi bi-check2"></i>
                                        </span>
                                    )}
                                    <span className={`cal-session__dur ${it.race ? "is-race" : it.label === "Sprint" ? "is-sprint" : ""}`}>{it.dur}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </>
    );
}

export default ScheduleGroups;
