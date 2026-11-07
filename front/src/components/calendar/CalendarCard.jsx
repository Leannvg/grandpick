import { useState } from "react";
import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import { getFlagEmoji } from "../../utils/helpers";
import { STATUS, buildSchedule, formatSessionTime } from "../../utils/schedule";
import "../../assets/styles/calendar.css";

function CalendarCard({ race, roundNumber, status, dayLabel, monthLabel, practices = [], predictionsByRaceId = {} }) {
    const [isOpen, setIsOpen] = useState(false);
    const [zoneMode, setZoneMode] = useState("mine");

    const circuitZone = race.circuit?.timezone || "UTC";
    const circuitId = race.circuit?._id;
    const sessions = [...race.sessions].sort(
        (a, b) => DateTime.fromISO(a.date_race).toMillis() - DateTime.fromISO(b.date_race).toMillis()
    );
    const groups = buildSchedule(sessions, practices);
    const hasSprint = race.sessionTypes.includes("sprint");
    const statusInfo = STATUS[status];
    const panelId = `cal-panel-${race._id}`;

    return (
        <article className={`cal-card ${isOpen ? "is-open" : ""}`}>
            <div className="cal-card__row" onClick={() => setIsOpen((v) => !v)}>
                <div className="cal-card__rail">
                    <span className="cal-card__ord">{roundNumber}<sup>º</sup></span>
                </div>

                <div className="cal-card__info">
                    <div className="cal-card__top">
                        <div className="cal-card__loc">
                            <span className="emoji-flag">{getFlagEmoji(race.circuit?.country)}</span>
                            <span className="cal-card__country">{race.circuit.country_name || race.circuit.country}</span>
                        </div>
                        {hasSprint && <span className="cal-card__sprint">SPRINT</span>}
                    </div>
                    <p className="cal-card__circuit">{race.circuit.circuit_name}</p>
                </div>

                <button
                    type="button"
                    className="cal-card__toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    aria-label={isOpen ? "Ocultar horarios" : "Mostrar horarios"}
                >
                    <i className="bi bi-chevron-down cal-card__chevron"></i>
                </button>

                <div className={`cal-card__date is-${status}`}>
                    <span className="cal-card__day">{dayLabel}</span>
                    <span className="cal-card__month">{monthLabel}</span>
                    <span className="cal-card__status">
                        <i className={`bi ${statusInfo.icon}`}></i>
                        {statusInfo.label}
                    </span>
                </div>
            </div>

            <div className="cal-card__panel-wrap" id={panelId}>
                <div className="cal-card__panel">
                    <div className="cal-card__panel-inner">
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
                    </div>
                </div>
            </div>
        </article>
    );
}

export default CalendarCard;
